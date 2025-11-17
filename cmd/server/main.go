package main

import (
	"log"
	"net"
	"net/http"
	"sync"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"google.golang.org/grpc"

	"github.com/rajeev-chaurasia/voltstream/internal/config"
	internalgrpc "github.com/rajeev-chaurasia/voltstream/internal/grpc"
	"github.com/rajeev-chaurasia/voltstream/internal/kafka"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

func main() {
	cfg := config.Load()

	producer, err := kafka.NewProducer(cfg.KafkaBrokers, cfg.KafkaTopic)
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

	lis, err := net.Listen("tcp", cfg.GRPCPort)
	if err != nil {
		log.Fatalf("Failed to listen on %s: %v", cfg.GRPCPort, err)
	}

	grpcServer := grpc.NewServer()
	telemetryServer := internalgrpc.NewTelemetryServer(producer, config.TelemetryChannelBuffer)
	pb.RegisterTelemetryServiceServer(grpcServer, telemetryServer)

	var wg sync.WaitGroup
	telemetryServer.StartWorkers(cfg.WorkerPoolSize, &wg)

	go func() {
		http.Handle("/metrics", promhttp.Handler())
		log.Println("Prometheus metrics available at :2112/metrics")
		if err := http.ListenAndServe(":2112", nil); err != nil {
			log.Fatalf("Metrics server error: %v", err)
		}
	}()

	log.Printf("gRPC server listening on %s", cfg.GRPCPort)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("gRPC server failed: %v", err)
	}
}
