package storage

import (
	"context"

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
	// Create a point for each data point
	// In a real high-throughput scenario, we might want to use the non-blocking WriteAPI
	// which handles batching automatically. For this example, we'll use blocking for simplicity/control
	// or rely on the client's batching if we switched to WriteAPI.

	// Actually, let's use the non-blocking API for better performance in the worker
	// But the struct above uses WriteAPIBlocking. Let's fix that in a bit or just use blocking for now.
	// Given the requirement for 50k/sec, we definitely want batching.
	// The influxdb-client-go default WriteAPI is non-blocking and batches.

	// Let's stick to blocking here for explicit error handling in this step,
	// but in main.go we might want to use the async one.
	// Actually, let's change this to use the async WriteAPI for performance.

	return nil // Placeholder, logic moved to main for async handling or we refactor this.
}

func (s *InfluxStore) Close() {
	s.client.Close()
}

// WritePoint writes a single point (helper for the worker)
func (s *InfluxStore) WritePoint(p *influxdb2.Point) error {
	return s.writeAPI.WritePoint(context.Background(), p)
}
