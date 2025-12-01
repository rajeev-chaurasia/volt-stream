package storage

import (
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

type InfluxStore struct {
	client   influxdb2.Client
	writeAPI api.WriteAPI
}

func NewInfluxStore(url, token, org, bucket string) *InfluxStore {
	client := influxdb2.NewClient(url, token)
	writeAPI := client.WriteAPI(org, bucket)
	return &InfluxStore{
		client:   client,
		writeAPI: writeAPI,
	}
}

func (s *InfluxStore) WriteBatch(batch *pb.TelemetryBatch) error {
	timestamp := time.UnixMilli(batch.Timestamp)
	for _, point := range batch.Points {
		p := influxdb2.NewPoint(
			"telemetry",
			map[string]string{
				"vin":       batch.VehicleId,
				"sensor_id": point.SensorId,
			},
			map[string]interface{}{
				"value": point.Value,
			},
			timestamp,
		)
		s.writeAPI.WritePoint(p)
	}
	return nil
}

func (s *InfluxStore) Errors() <-chan error {
	return s.writeAPI.Errors()
}

func (s *InfluxStore) Flush() {
	s.writeAPI.Flush()
}

func (s *InfluxStore) Close() {
	s.writeAPI.Flush()
	s.client.Close()
}
