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

var (
	vehicleState = make(map[string]bool)
	stateMutex   sync.RWMutex
)

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
				processBatch(&batch, alertProducer, cfg.AlertTopic)
			}
		}(pc)
	}

	<-signals
	log.Println("Alert worker shutting down...")
}

func processBatch(batch *pb.TelemetryBatch, producer sarama.AsyncProducer, alertTopic string) {
	for _, p := range batch.Points {
		if strings.Contains(p.SensorId, "Temperature") {
			isOverheating := p.Value > config.CriticalBatteryTemp

			stateMutex.RLock()
			wasOverheating := vehicleState[batch.VehicleId+"_temp"]
			stateMutex.RUnlock()

			if isOverheating && !wasOverheating {
				sendAlert(producer, alertTopic, batch.VehicleId, "CRITICAL", "Battery Overheat Detected", p.Value)
				stateMutex.Lock()
				vehicleState[batch.VehicleId+"_temp"] = true
				stateMutex.Unlock()
			} else if !isOverheating && wasOverheating {
				sendAlert(producer, alertTopic, batch.VehicleId, "RESOLVED", "Battery Temperature Normal", p.Value)
				stateMutex.Lock()
				vehicleState[batch.VehicleId+"_temp"] = false
				stateMutex.Unlock()
			}
		}

		if strings.Contains(p.SensorId, "Tire.Pressure") {
			isLow := p.Value < config.CriticalTirePressure

			stateMutex.RLock()
			wasLow := vehicleState[batch.VehicleId+"_tire"]
			stateMutex.RUnlock()

			if isLow && !wasLow {
				sendAlert(producer, alertTopic, batch.VehicleId, "WARNING", "Low Tire Pressure", p.Value)
				stateMutex.Lock()
				vehicleState[batch.VehicleId+"_tire"] = true
				stateMutex.Unlock()
			} else if !isLow && wasLow {
				sendAlert(producer, alertTopic, batch.VehicleId, "RESOLVED", "Tire Pressure Normal", p.Value)
				stateMutex.Lock()
				vehicleState[batch.VehicleId+"_tire"] = false
				stateMutex.Unlock()
			}
		}
	}
}

func sendAlert(producer sarama.AsyncProducer, topic, vin, level, msg string, val float64) {
	alert := Alert{
		VehicleId: vin,
		Type:      level,
		Message:   msg,
		Value:     val,
		Timestamp: time.Now().UnixMilli(),
	}

	bytes, _ := json.Marshal(alert)
	kafkaMsg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(vin),
		Value: sarama.ByteEncoder(bytes),
	}
	producer.Input() <- kafkaMsg
}
