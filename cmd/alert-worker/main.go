package main

import (
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/rajeev-chaurasia/voltstream/internal/config"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
	"google.golang.org/protobuf/proto"
)

type Alert struct {
	VehicleId string  `json:"vehicle_id"`
	Type      string  `json:"type"`
	Message   string  `json:"message"`
	Value     float64 `json:"value"`
	Timestamp int64   `json:"timestamp"`
}

type AlertState struct {
	isAlerting   bool
	lastAlertTime int64 // Unix timestamp in seconds
}

var (
	vehicleState = make(map[string]*AlertState)
	stateMutex   sync.RWMutex
	// Prevent alert storms with cooldown and hysteresis
	alertCooldown = int64(300) // 5 minutes between same alert type
	hysteresis    = 2.0         // 2°C/PSI buffer to prevent alert flapping
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	log.Println("Starting Alert Worker...")
	cfg := config.Load()

	prodConfig := sarama.NewConfig()
	prodConfig.Version = sarama.V3_4_0_0
	prodConfig.Producer.Return.Successes = false
	prodConfig.Producer.Return.Errors = true

	alertProducer, err := sarama.NewAsyncProducer(cfg.KafkaBrokers, prodConfig)
	if err != nil {
		log.Fatalf("Alert producer creation failed: %v", err)
	}
	defer alertProducer.Close()

	consumerConfig := sarama.NewConfig()
	consumerConfig.Version = sarama.V3_4_0_0
	consumerConfig.Consumer.Return.Errors = true

	consumer, err := sarama.NewConsumer(cfg.KafkaBrokers, consumerConfig)
	if err != nil {
		log.Fatalf("Consumer creation failed: %v", err)
	}
	defer consumer.Close()

	partitions, err := consumer.Partitions(cfg.KafkaTopic)
	if err != nil {
		log.Fatalf("Failed to get partitions: %v", err)
	}

	// Initialize InfluxDB for alert storage
	influxURL := getEnv("INFLUXDB_URL", "http://localhost:18086")
	influxToken := getEnv("INFLUXDB_TOKEN", "my-super-secret-auth-token")
	influxOrg := getEnv("INFLUXDB_ORG", "voltstream")
	influxBucket := getEnv("INFLUXDB_BUCKET", "telemetry")

	influxClient := influxdb2.NewClient(influxURL, influxToken)
	defer influxClient.Close()
	writeAPI := influxClient.WriteAPI(influxOrg, influxBucket)
	defer writeAPI.Flush()

	log.Printf("Connected to InfluxDB at %s", influxURL)

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)

	log.Printf("Monitoring %d partition(s) for anomalies...", len(partitions))

	for _, partition := range partitions {
		pc, err := consumer.ConsumePartition(cfg.KafkaTopic, partition, sarama.OffsetNewest)
		if err != nil {
			log.Printf("Partition %d consumer failed: %v", partition, err)
			continue
		}

		go func(pc sarama.PartitionConsumer) {
			defer pc.Close()
			for msg := range pc.Messages() {
				var batch pb.TelemetryBatch
				if err := proto.Unmarshal(msg.Value, &batch); err != nil {
					log.Printf("Protobuf unmarshal failed: %v", err)
					continue
				}
				processBatch(&batch, alertProducer, cfg.AlertTopic, writeAPI)
			}
		}(pc)
	}

	<-signals
	log.Println("Alert worker shutting down...")
}

func processBatch(batch *pb.TelemetryBatch, producer sarama.AsyncProducer, alertTopic string, writeAPI api.WriteAPI) {
	for _, p := range batch.Points {
		if strings.Contains(p.SensorId, "Temperature") {
			// Hysteresis: trigger at 70°C, clear at 68°C (prevents flapping)
			key := batch.VehicleId + "_temp"
			now := time.Now().Unix()

			stateMutex.Lock()
			state, exists := vehicleState[key]
			if !exists {
				state = &AlertState{isAlerting: false, lastAlertTime: 0}
				vehicleState[key] = state
			}

			// Check if cooldown period has passed
			inCooldown := (now - state.lastAlertTime) < alertCooldown

			if p.Value > config.CriticalBatteryTemp && !state.isAlerting && !inCooldown {
				// Trigger alert
				state.isAlerting = true
				state.lastAlertTime = now
				stateMutex.Unlock()
				sendAlert(producer, alertTopic, writeAPI, batch.VehicleId, "CRITICAL", "Battery Overheat Detected", p.Value)
			} else if p.Value < (config.CriticalBatteryTemp-hysteresis) && state.isAlerting {
				// Clear alert (with hysteresis)
				state.isAlerting = false
				stateMutex.Unlock()
				sendAlert(producer, alertTopic, writeAPI, batch.VehicleId, "RESOLVED", "Battery Temperature Normal", p.Value)
			} else {
				stateMutex.Unlock()
			}
		}

		if strings.Contains(p.SensorId, "Tire.Pressure") {
			// Hysteresis: trigger at 25 PSI, clear at 27 PSI
			key := batch.VehicleId + "_tire"
			now := time.Now().Unix()

			stateMutex.Lock()
			state, exists := vehicleState[key]
			if !exists {
				state = &AlertState{isAlerting: false, lastAlertTime: 0}
				vehicleState[key] = state
			}

			inCooldown := (now - state.lastAlertTime) < alertCooldown

			if p.Value < config.CriticalTirePressure && !state.isAlerting && !inCooldown {
				state.isAlerting = true
				state.lastAlertTime = now
				stateMutex.Unlock()
				sendAlert(producer, alertTopic, writeAPI, batch.VehicleId, "WARNING", "Low Tire Pressure", p.Value)
			} else if p.Value > (config.CriticalTirePressure+hysteresis) && state.isAlerting {
				state.isAlerting = false
				stateMutex.Unlock()
				sendAlert(producer, alertTopic, writeAPI, batch.VehicleId, "RESOLVED", "Tire Pressure Normal", p.Value)
			} else {
				stateMutex.Unlock()
			}
		}
	}
}

func sendAlert(producer sarama.AsyncProducer, topic string, writeAPI api.WriteAPI, vin, level, msg string, val float64) {
	alert := Alert{
		VehicleId: vin,
		Type:      level,
		Message:   msg,
		Value:     val,
		Timestamp: time.Now().UnixMilli(),
	}

	// Send to Kafka (for backward compatibility)
	bytes, _ := json.Marshal(alert)
	kafkaMsg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(vin),
		Value: sarama.ByteEncoder(bytes),
	}
	producer.Input() <- kafkaMsg

	// Write to InfluxDB for dashboard queries
	point := write.NewPoint(
		"alerts",
		map[string]string{
			"vin":   vin,
			"level": level,
		},
		map[string]interface{}{
			"message": msg,
			"value":   val,
		},
		time.Unix(alert.Timestamp/1000, (alert.Timestamp%1000)*1000000),
	)
	writeAPI.WritePoint(point)
	// Production: Don't log every alert (causes log explosion)
	// Use monitoring/alerting system instead
}
