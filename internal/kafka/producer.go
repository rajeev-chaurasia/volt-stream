package kafka

import (
	"log"

	"github.com/IBM/sarama"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
	"google.golang.org/protobuf/proto"
)

type Producer struct {
	producer sarama.AsyncProducer
	topic    string
}

func NewProducer(brokers []string, topic string) (*Producer, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V3_4_0_0
	config.Producer.Return.Successes = false // Async doesn't wait for success
	config.Producer.Return.Errors = true
	config.Producer.RequiredAcks = sarama.WaitForLocal   // Only wait for leader to ack
	config.Producer.Compression = sarama.CompressionNone // Disable compression for Next.js compatibility
	config.Producer.Flush.Frequency = 100 * 1000 * 1000  // Flush every 100ms
	config.Producer.Flush.Messages = 100                 // Or every 100 messages
	config.ChannelBufferSize = 2048                      // Increased buffer for high throughput

	producer, err := sarama.NewAsyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	// Handle errors in background
	go func() {
		for err := range producer.Errors() {
			log.Printf("Kafka Producer Error: %v", err)
		}
	}()

	return &Producer{
		producer: producer,
		topic:    topic,
	}, nil
}

func (p *Producer) Publish(batch *pb.TelemetryBatch) error {
	// Serialize to Protobuf
	bytes, err := proto.Marshal(batch)
	if err != nil {
		return err
	}

	msg := &sarama.ProducerMessage{
		Topic: p.topic,
		Key:   sarama.StringEncoder(batch.VehicleId), // Ensure ordering by Vehicle ID
		Value: sarama.ByteEncoder(bytes),
	}

	p.producer.Input() <- msg
	return nil
}

func (p *Producer) Close() error {
	return p.producer.Close()
}
