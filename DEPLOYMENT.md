# VoltStream Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Minimum 8GB RAM, 4 CPU cores recommended
- 20GB available disk space

## Quick Start

### 1. Build All Services

```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Start Infrastructure

```bash
docker-compose -f docker-compose.prod.yml up -d zookeeper kafka influxdb
```

Wait 30 seconds for Kafka to initialize.

### 3. Start VoltStream Services

```bash
docker-compose -f docker-compose.prod.yml up -d grpc-server worker alert-worker simulator dashboard
```

### 4. Access Dashboard

Open browser: http://localhost:3000

### 5. Monitor Metrics

Prometheus metrics: http://localhost:2112/metrics

## Environment Variables

### Go Services

Create `.env` file in project root:

```bash
# gRPC Server
GRPC_PORT=:50051

# Kafka (Docker internal network)
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC=telemetry-raw
KAFKA_ALERT_TOPIC=telemetry-alerts

# InfluxDB (Docker internal network)
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=voltstream-token-2024
INFLUXDB_ORG=voltstream
INFLUXDB_BUCKET=telemetry

# Simulator
NUM_VEHICLES=1000
SEND_FREQUENCY_HZ=10
```

### Dashboard

Create `dashboard-ui/.env.local`:

```bash
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC=telemetry-raw
KAFKA_ALERT_TOPIC=telemetry-alerts
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace voltstream
```

### 2. Deploy Infrastructure

```bash
kubectl apply -f k8s/zookeeper.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/influxdb.yaml
```

### 3. Deploy Services

```bash
kubectl apply -f k8s/grpc-server.yaml
kubectl apply -f k8s/worker.yaml
kubectl apply -f k8s/alert-worker.yaml
kubectl apply -f k8s/simulator.yaml
kubectl apply -f k8s/dashboard.yaml
```

### 4. Expose Dashboard

```bash
kubectl port-forward -n voltstream service/dashboard 3000:3000
```

## Scaling

### Horizontal Scaling

```bash
# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale worker=3

# Scale alert workers
docker-compose -f docker-compose.prod.yml up -d --scale alert-worker=2

# Kubernetes
kubectl scale deployment worker --replicas=3 -n voltstream
```

### Vertical Scaling

Modify `docker-compose.prod.yml`:

```yaml
services:
  worker:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Monitoring

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f grpc-server

# Kubernetes
kubectl logs -f deployment/grpc-server -n voltstream
```

### Health Checks

```bash
# Check Kafka topics
docker exec -it voltstream-kafka-1 kafka-topics --list --bootstrap-server localhost:9092

# Check InfluxDB
curl http://localhost:8086/health

# Check gRPC server metrics
curl http://localhost:2112/metrics
```

## Troubleshooting

### Kafka Connection Issues

```bash
# Check Kafka is ready
docker-compose -f docker-compose.prod.yml logs kafka | grep "started"

# Verify topics exist
docker exec voltstream-kafka-1 kafka-topics --describe --bootstrap-server localhost:9092
```

### InfluxDB Authentication

```bash
# Reset InfluxDB
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d influxdb
```

### Memory Issues

```bash
# Check container memory usage
docker stats

# Increase Docker memory limit (Docker Desktop: Settings > Resources)
```

## Production Checklist

- [ ] Change default InfluxDB credentials
- [ ] Configure TLS for gRPC
- [ ] Enable Kafka authentication (SASL)
- [ ] Set up external monitoring (Grafana)
- [ ] Configure log aggregation
- [ ] Set resource limits for all containers
- [ ] Configure persistent volumes
- [ ] Set up backup strategy for InfluxDB
- [ ] Configure alerting (Prometheus AlertManager)
- [ ] Enable rate limiting on dashboard API

## Performance Tuning

### Kafka

```yaml
environment:
  KAFKA_NUM_PARTITIONS: 10
  KAFKA_DEFAULT_REPLICATION_FACTOR: 3
  KAFKA_LOG_RETENTION_HOURS: 24
```

### InfluxDB

```yaml
environment:
  INFLUXD_STORAGE_CACHE_MAX_MEMORY_SIZE: 1073741824  # 1GB
  INFLUXD_STORAGE_WAL_MAX_CONCURRENT_WRITES: 128
```

### Worker Pool

```bash
WORKER_POOL_SIZE=20  # Increase for higher throughput
```

## Shutdown

```bash
# Graceful shutdown
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes all data)
docker-compose -f docker-compose.prod.yml down -v
```
