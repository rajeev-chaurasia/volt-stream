package storage

import (
	"context"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

type InfluxStore struct {
	client   influxdb2.Client
	writeAPI api.WriteAPIBlocking
}

func NewInfluxStore(url, token, org, bucket string) *InfluxStore {
	client := influxdb2.NewClient(url, token)
	writeAPI := client.WriteAPIBlocking(org, bucket)
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
				"vehicle_id": batch.VehicleId,
				"sensor_id":  point.SensorId,
			},
			map[string]interface{}{
				"value": point.Value,
			},
			timestamp,
		)
		if err := s.writeAPI.WritePoint(context.Background(), p); err != nil {
			return err
		}
	}
	return nil
}

func (s *InfluxStore) Close() {
	s.client.Close()
}

func (s *InfluxStore) WritePoint(p *influxdb2.Point) error {
	return s.writeAPI.WritePoint(context.Background(), p)
}
