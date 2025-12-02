package config

const (
	// Network timeouts
	GRPCConnectionTimeout = 10 // seconds
	KafkaConnectionTimeout = 30 // seconds
	InfluxDBWriteTimeout = 5 // seconds
	
	// Kafka defaults
	DefaultKafkaPartitions = 10
	DefaultKafkaReplication = 1
	DefaultConsumerGroup = "voltstream-workers"
	
	// Buffer sizes for 10k events/sec throughput
	KafkaProducerBufferSize = 2048 // Increased to handle high volume
	TelemetryChannelBuffer = 2000  // Doubled to prevent queue overflow
	
	// Batch processing
	InfluxDBBatchSize = 5000
	InfluxDBFlushInterval = 1000 // milliseconds
	
	// Simulator constraints
	MaxConcurrentGoroutines = 100
	SimulatorSpawnDelay = 10 // milliseconds
	
	// Alert thresholds (realistic values to reduce false positives)
	CriticalBatteryTemp = 70.0 // celsius - triggers overheat alert
	WarningBatteryTemp = 65.0  // celsius (concerning)
	CriticalTirePressure = 25.0 // PSI - triggers low pressure alert
	WarningTirePressure = 28.0  // PSI (needs attention)
	
	// Vehicle telemetry bounds
	MinLatitude = 37.7
	MaxLatitude = 37.8
	MinLongitude = -122.5
	MaxLongitude = -122.4
	MinSpeed = 0.0
	MaxSpeed = 120.0 // km/h
	MinBatteryTemp = 20.0
	MaxBatteryTemp = 65.0
	MinTirePressure = 28.0
	MaxTirePressure = 38.0
)
