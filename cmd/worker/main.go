package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/IBM/sarama"
	"github.com/rajeev-chaurasia/voltstream/internal/config"
	"github.com/rajeev-chaurasia/voltstream/internal/storage"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
	"google.golang.org/protobuf/proto"
)

func main() {
	cfg := config.Load()

	store := storage.NewInfluxStore(cfg.InfluxDBURL, cfg.InfluxDBToken, cfg.InfluxDBOrg, cfg.InfluxDBBucket)
	defer store.Close()

	go func() {
		for err := range store.Errors() {
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

			if err := store.WriteBatch(&batch); err != nil {
				log.Printf("InfluxDB write failed: %v", err)
			}

		case err := <-partitionConsumer.Errors():
			log.Printf("Kafka error: %v", err)

		case <-sigchan:
			log.Println("Graceful shutdown initiated")
			store.Flush()
			return
		}
	}
}
