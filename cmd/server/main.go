package main

import (
	"log"
	"net"
	"sync"

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

	log.Printf("gRPC server listening on %s", cfg.GRPCPort)
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("gRPC server failed: %v", err)
	}
}
