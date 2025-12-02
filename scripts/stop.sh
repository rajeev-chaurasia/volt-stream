#!/bin/bash

# VoltStream Stop Script
# Stops all local development services

set -e

echo "🛑 Stopping VoltStream services..."

# Stop Go services
echo "Stopping Go services..."
pkill -f "bin/server" || true
pkill -f "bin/worker" || true
pkill -f "bin/alert-worker" || true
pkill -f "bin/simulator" || true

# Stop dashboard
echo "Stopping Dashboard..."
pkill -f "next-server" || true
pkill -f "npm.*dev" || true

# Stop Docker infrastructure
echo "Stopping Docker containers..."
docker-compose down

echo "✅ All services stopped"
