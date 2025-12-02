#!/bin/bash

# VoltStream Local Development Startup Script
# Starts all services in background

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starting VoltStream Local Development Environment..."
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create logs and pids directory
mkdir -p logs .pids

# Start Docker infrastructure
echo "🐳 Starting Docker infrastructure (Kafka, InfluxDB, Zookeeper)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for Kafka to be ready..."
sleep 10

# Build Go services if not already built
if [ ! -f "bin/server" ]; then
    echo "🔨 Building Go services..."
    go build -o bin/server ./cmd/server
    go build -o bin/worker ./cmd/worker
    go build -o bin/alert-worker ./cmd/alert-worker
    go build -o bin/simulator ./cmd/simulator
    echo "✅ Go services built successfully"
fi

echo ""
echo "================================================"
echo "  Starting services in background"
echo "================================================"
echo ""

# Start services in background
echo "📡 Starting gRPC Server..."
KAFKA_BROKER=localhost:19092 GRPC_PORT=:50051 ./bin/server > logs/server.log 2>&1 &
echo $! > .pids/server.pid
echo "   PID: $(cat .pids/server.pid) | Logs: logs/server.log"

sleep 2

echo "💾 Starting Storage Worker..."
KAFKA_BROKER=localhost:19092 \
INFLUXDB_URL=http://localhost:18086 \
INFLUXDB_TOKEN=my-super-secret-auth-token \
INFLUXDB_ORG=voltstream \
INFLUXDB_BUCKET=telemetry \
./bin/worker > logs/worker.log 2>&1 &
echo $! > .pids/worker.pid
echo "   PID: $(cat .pids/worker.pid) | Logs: logs/worker.log"

sleep 2

echo "🚨 Starting Alert Worker..."
KAFKA_BROKER=localhost:19092 ./bin/alert-worker > logs/alert-worker.log 2>&1 &
echo $! > .pids/alert-worker.pid
echo "   PID: $(cat .pids/alert-worker.pid) | Logs: logs/alert-worker.log"

sleep 2

echo "🚗 Starting Simulator (1000 vehicles @ 10Hz = 10k events/sec)..."
NUM_VEHICLES=1000 \
SEND_FREQUENCY_HZ=10 \
SERVER_ADDR=localhost:50051 \
./bin/simulator > logs/simulator.log 2>&1 &
echo $! > .pids/simulator.pid
echo "   PID: $(cat .pids/simulator.pid) | Logs: logs/simulator.log"

sleep 2

echo "🎨 Starting Dashboard..."
cd "$PROJECT_DIR/dashboard-ui"
npm run dev > "$PROJECT_DIR/logs/dashboard.log" 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > "$PROJECT_DIR/.pids/dashboard.pid"
echo "   PID: $DASHBOARD_PID | Logs: logs/dashboard.log"

echo ""
echo "✅ All services started!"
echo ""
echo "================================================"
echo "  Access Points"
echo "================================================"
echo ""
echo "🌐 Dashboard:        http://localhost:3000"
echo "💾 InfluxDB:         http://localhost:18086"
echo ""
echo "================================================"
echo "  View Logs"
echo "================================================"
echo ""
echo "tail -f logs/server.log        # gRPC Server"
echo "tail -f logs/worker.log        # Storage Worker"
echo "tail -f logs/alert-worker.log  # Alert Worker"
echo "tail -f logs/simulator.log     # Simulator"
echo "tail -f logs/dashboard.log     # Dashboard"
echo ""
echo "Or use: ./scripts/logs.sh [service]"
echo ""
echo "================================================"
echo "  To Stop All Services"
echo "================================================"
echo ""
echo "./scripts/stop.sh"
echo ""
