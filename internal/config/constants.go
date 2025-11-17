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
	
	// Buffer sizes
	KafkaProducerBufferSize = 256
	TelemetryChannelBuffer = 1000
	
	// Batch processing
	InfluxDBBatchSize = 5000
	InfluxDBFlushInterval = 1000 // milliseconds
	
	// Simulator constraints
	MaxConcurrentGoroutines = 100
	SimulatorSpawnDelay = 10 // milliseconds
	
	// Alert thresholds
	CriticalBatteryTemp = 58.0 // celsius
	WarningBatteryTemp = 50.0
	CriticalTirePressure = 30.5 // PSI
	WarningTirePressure = 32.0
	
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
