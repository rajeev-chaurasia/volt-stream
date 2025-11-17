package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"google.golang.org/protobuf/proto"
	"github.com/rajeev-chaurasia/voltstream/internal/config"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

func main() {
	cfg := config.Load()

	client := influxdb2.NewClient(cfg.InfluxDBURL, cfg.InfluxDBToken)
	writeAPI := client.WriteAPI(cfg.InfluxDBOrg, cfg.InfluxDBBucket)

	go func() {
		for err := range writeAPI.Errors() {
			log.Printf("InfluxDB write error: %v", err)
		}
	}()

	consumerConfig := sarama.NewConfig()
	consumerConfig.Version = sarama.V3_4_0_0
	consumerConfig.Consumer.Return.Errors = true
	consumerConfig.Consumer.Offsets.Initial = sarama.OffsetNewest

	consumer, err := sarama.NewConsumer(cfg.KafkaBrokers, consumerConfig)
	if err != nil {
		log.Fatalf("Kafka consumer creation failed: %v", err)
	}
	defer consumer.Close()

	partitionConsumer, err := consumer.ConsumePartition(cfg.KafkaTopic, 0, sarama.OffsetNewest)
	if err != nil {
		log.Fatalf("Partition consumer failed: %v", err)
	}
	defer partitionConsumer.Close()

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	log.Printf("Storage worker started (InfluxDB: %s, Kafka: %s)", cfg.InfluxDBURL, cfg.KafkaBrokers[0])

	for {
		select {
		case msg := <-partitionConsumer.Messages():
			var batch pb.TelemetryBatch
			if err := proto.Unmarshal(msg.Value, &batch); err != nil {
				log.Printf("Protobuf unmarshal failed: %v", err)
				continue
			}

			ts := time.UnixMilli(batch.Timestamp)
			for _, dp := range batch.Points {
				p := influxdb2.NewPoint(
					"telemetry",
					map[string]string{"vin": batch.VehicleId, "sensor_id": dp.SensorId},
					map[string]interface{}{"value": dp.Value},
					ts,
				)
				writeAPI.WritePoint(p)
			}

		case err := <-partitionConsumer.Errors():
			log.Printf("Kafka error: %v", err)

		case <-sigchan:
			log.Println("Graceful shutdown initiated")
			writeAPI.Flush()
			client.Close()
			return
		}
	}
}
