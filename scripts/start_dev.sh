#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting VoltStream Development Environment...${NC}"

# 1. Kill existing processes
echo -e "${GREEN}🔪 Killing existing processes...${NC}"
pkill -f "bin/server" || true
pkill -f "bin/worker" || true
pkill -f "bin/alert-worker" || true
pkill -f "bin/simulator" || true
pkill -f "next-server" || true
pkill -f "node" || true

# 2. Clear logs
echo -e "${GREEN}🧹 Clearing logs...${NC}"
rm -f logs/*.log
mkdir -p logs

# 3. Start Services
echo -e "${GREEN}🔌 Starting gRPC Server...${NC}"
./bin/server > logs/server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 2

echo -e "${GREEN}💾 Starting Storage Worker...${NC}"
./bin/worker > logs/worker.log 2>&1 &
WORKER_PID=$!
echo "Worker PID: $WORKER_PID"

echo -e "${GREEN}🚨 Starting Alert Worker...${NC}"
./bin/alert-worker > logs/alert-worker.log 2>&1 &
ALERT_PID=$!
echo "Alert Worker PID: $ALERT_PID"

echo -e "${GREEN}🚗 Starting Simulator...${NC}"
./bin/simulator > logs/simulator.log 2>&1 &
SIM_PID=$!
echo "Simulator PID: $SIM_PID"

# 4. Start Dashboard
echo -e "${GREEN}📊 Starting Dashboard...${NC}"
cd dashboard-ui
npm run dev > ../logs/dashboard.log 2>&1 &
DASH_PID=$!
cd ..
echo "Dashboard PID: $DASH_PID"

echo -e "${GREEN}✅ All services started!${NC}"
echo -e "Server logs:    tail -f logs/server.log"
echo -e "Worker logs:    tail -f logs/worker.log"
echo -e "Alert logs:     tail -f logs/alert-worker.log"
echo -e "Simulator logs: tail -f logs/simulator.log"
echo -e "Dashboard logs: tail -f logs/dashboard.log"
