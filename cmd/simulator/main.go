package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/rajeev-chaurasia/voltstream/internal/config"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

const (
	ServerAddr = "127.0.0.1:50051"
	SendFreqHz = 10
)

func main() {
	vehicleCount := getEnvInt("NUM_VEHICLES", 1000)
	sendFreqHz := getEnvInt("SEND_FREQUENCY_HZ", SendFreqHz)
	
	log.Printf("Starting Fleet Simulator (vehicles: %d, frequency: %dHz)...", vehicleCount, sendFreqHz)

	conn, err := grpc.Dial(ServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer conn.Close()

	client := pb.NewTelemetryServiceClient(conn)

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, config.MaxConcurrentGoroutines)

	log.Printf("Spawning %d vehicles...", vehicleCount)
	for i := 0; i < vehicleCount; i++ {
		wg.Add(1)
		go func(id int) {
			semaphore <- struct{}{}
			time.Sleep(time.Duration(config.SimulatorSpawnDelay) * time.Millisecond)
			<-semaphore
			
			defer wg.Done()
			simulateVehicle(client, id, sendFreqHz)
		}(i)
	}

	log.Println("All vehicles spawned, streaming data...")
	wg.Wait()
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

// Waypoint represents a GPS coordinate on a vehicle route
type Waypoint struct {
	Lat, Lon float64
}

// San Francisco routes for vehicle simulation
var Routes = [][]Waypoint{
	// Golden Gate Bridge to Downtown (Southeast)
	{{37.8199, -122.4783}, {37.8086, -122.4752}, {37.8024, -122.4485}, {37.7952, -122.4029}, {37.7879, -122.4075}},
	// Bay Bridge to Civic Center (West)
	{{37.7983, -122.3778}, {37.7885, -122.3927}, {37.7842, -122.4070}, {37.7793, -122.4192}, {37.7749, -122.4194}},
	// Twin Peaks to Mission District (East)
	{{37.7544, -122.4477}, {37.7600, -122.4350}, {37.7645, -122.4250}, {37.7650, -122.4150}, {37.7600, -122.4100}},
}

func simulateVehicle(client pb.TelemetryServiceClient, id int, freqHz int) {
	vin := fmt.Sprintf("RVN%09d", id)

	routeIdx := rand.Intn(len(Routes))
	route := Routes[routeIdx]

	currentLeg := rand.Intn(len(route) - 1)
	progress := rand.Float64()

	stream, err := client.StreamTelemetry(context.Background())
	if err != nil {
		log.Printf("Stream creation failed for %s: %v", vin, err)
		return
	}

	// Handle server acknowledgments in background
	go func() {
		for {
			if _, err := stream.Recv(); err != nil {
				return
			}
		}
	}()

	interval := time.Duration(1000/freqHz) * time.Millisecond
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	anomalyType := 0
	anomalyDuration := 0

	for range ticker.C {
		start := route[currentLeg]
		end := route[currentLeg+1]

		lat := start.Lat + (end.Lat-start.Lat)*progress
		lon := start.Lon + (end.Lon-start.Lon)*progress

		speed := 0.005
		progress += speed

		if progress >= 1.0 {
			progress = 0
			currentLeg++
			if currentLeg >= len(route)-1 {
				currentLeg = 0
			}
		}

		speedVal := config.MinSpeed + rand.Float64()*(config.MaxSpeed-config.MinSpeed)

		var tempVal float64
		if id%10 == 0 {
			tempVal = config.CriticalBatteryTemp + rand.Float64()*(config.MaxBatteryTemp-config.CriticalBatteryTemp)
		} else {
			tempVal = config.MinBatteryTemp + rand.Float64()*(config.WarningBatteryTemp-config.MinBatteryTemp)
		}

		pressureVal := config.MinTirePressure + rand.Float64()*(config.MaxTirePressure-config.MinTirePressure)

		// 1% chance to trigger transient anomaly
		if anomalyType == 0 && rand.Float64() < 0.01 {
			anomalyType = rand.Intn(2) + 1
			anomalyDuration = 50 + rand.Intn(50)
		}

		if anomalyType == 1 {
			tempVal = config.CriticalBatteryTemp + rand.Float64()*10
			anomalyDuration--
		} else if anomalyType == 2 {
			pressureVal = config.MinTirePressure - 3 + rand.Float64()*2
			anomalyDuration--
		}

		if anomalyDuration <= 0 {
			anomalyType = 0
		}

		batch := generateBatch(vin, lat, lon, speedVal, tempVal, pressureVal)
		if err := stream.Send(batch); err != nil {
			log.Printf("Send failed for %s: %v", vin, err)
			return
		}
	}
}

func generateBatch(vin string, lat, lon, speed, temp, pressure float64) *pb.TelemetryBatch {
	return &pb.TelemetryBatch{
		VehicleId: vin,
		Timestamp: time.Now().UnixMilli(),
		Points: []*pb.DataPoint{
			{SensorId: "Vehicle.Speed", Value: speed},
			{SensorId: "Vehicle.Powertrain.TractionBattery.Temperature.Average", Value: temp},
			{SensorId: "Vehicle.Chassis.Axle.Row1.Wheel.Left.Tire.Pressure", Value: pressure},
			{SensorId: "Vehicle.CurrentLocation.Latitude", Value: lat},
			{SensorId: "Vehicle.CurrentLocation.Longitude", Value: lon},
		},
	}
}
