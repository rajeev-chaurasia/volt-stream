package config

import (
	"os"
	"strconv"
)

type Config struct {
	GRPCPort       string
	KafkaBrokers   []string
	KafkaTopic     string
	AlertTopic     string
	WorkerPoolSize int
	InfluxDBURL    string
	InfluxDBToken  string
	InfluxDBOrg    string
	InfluxDBBucket string
}

// Load reads configuration from environment variables with fallback defaults.
// Defaults are set for local Docker development (ports 19092, 18086).
func Load() *Config {
	return &Config{
		GRPCPort:       getEnv("GRPC_PORT", ":50051"),
		KafkaBrokers:   []string{getEnv("KAFKA_BROKER", "localhost:19092")},
		KafkaTopic:     getEnv("KAFKA_TOPIC", "telemetry-raw"),
		AlertTopic:     getEnv("KAFKA_ALERT_TOPIC", "telemetry-alerts"),
		WorkerPoolSize: getEnvInt("WORKER_POOL_SIZE", 10),
		InfluxDBURL:    getEnv("INFLUXDB_URL", "http://localhost:18086"),
		InfluxDBToken:  getEnv("INFLUXDB_TOKEN", "my-super-secret-auth-token"),
		InfluxDBOrg:    getEnv("INFLUXDB_ORG", "voltstream"),
		InfluxDBBucket: getEnv("INFLUXDB_BUCKET", "telemetry"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	strValue := getEnv(key, "")
	if value, err := strconv.Atoi(strValue); err == nil {
		return value
	}
	return fallback
}
