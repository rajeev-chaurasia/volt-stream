package grpc

import (
	"io"
	"log"
	"sync"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/rajeev-chaurasia/voltstream/internal/kafka"
	"github.com/rajeev-chaurasia/voltstream/internal/telemetry"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

var (
	eventsReceived = promauto.NewCounter(prometheus.CounterOpts{
		Name: "voltstream_events_received_total",
		Help: "The total number of telemetry events received",
	})
	eventsProcessed = promauto.NewCounter(prometheus.CounterOpts{
		Name: "voltstream_events_processed_total",
		Help: "The total number of telemetry events processed and sent to Kafka",
	})
	processingLatency = promauto.NewHistogram(prometheus.HistogramOpts{
		Name:    "voltstream_processing_latency_seconds",
		Help:    "Time taken to process a batch",
		Buckets: prometheus.DefBuckets,
	})
)

type TelemetryServer struct {
	pb.UnimplementedTelemetryServiceServer
	dataQueue chan *pb.TelemetryBatch
	producer  *kafka.Producer
}

func NewTelemetryServer(producer *kafka.Producer, queueSize int) *TelemetryServer {
	return &TelemetryServer{
		dataQueue: make(chan *pb.TelemetryBatch, queueSize),
		producer:  producer,
	}
}

func (s *TelemetryServer) StreamTelemetry(stream pb.TelemetryService_StreamTelemetryServer) error {
	for {
		batch, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		eventsReceived.Inc()

		// Non-blocking push to channel (shed load if full)
		select {
		case s.dataQueue <- batch:
			// Successfully queued
			if err := stream.Send(&pb.ServerAck{Success: true}); err != nil {
				log.Printf("Failed to send ack: %v", err)
			}
		default:
			// Queue full, drop packet
			log.Println("Queue full, dropping packet")
			if err := stream.Send(&pb.ServerAck{Success: false, ErrorMessage: "Server overloaded"}); err != nil {
				log.Printf("Failed to send ack: %v", err)
			}
		}
	}
}

func (s *TelemetryServer) StartWorkers(workerCount int, wg *sync.WaitGroup) {
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			log.Printf("Worker %d started", id)
			for batch := range s.dataQueue {
				start := time.Now()

				// 1. Validate
				if err := telemetry.ValidateBatch(batch); err != nil {
					log.Printf("Invalid batch from %s: %v", batch.VehicleId, err)
					continue
				}

				// 2. Publish to Kafka
				if err := s.producer.Publish(batch); err != nil {
					log.Printf("Failed to publish to Kafka: %v", err)
					continue
				}

				eventsProcessed.Inc()
				processingLatency.Observe(time.Since(start).Seconds())
			}
		}(i)
	}
}
