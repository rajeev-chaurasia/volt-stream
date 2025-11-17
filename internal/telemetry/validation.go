package telemetry

import (
	"errors"
	"strings"

	pb "github.com/rajeev-chaurasia/voltstream/proto"
)

// ValidateBatch checks if the telemetry batch contains valid data.
func ValidateBatch(batch *pb.TelemetryBatch) error {
	if batch.VehicleId == "" {
		return errors.New("missing vehicle_id")
	}
	if len(batch.Points) == 0 {
		return errors.New("empty data points")
	}

	for _, p := range batch.Points {
		if p.SensorId == "" {
			return errors.New("missing sensor_id")
		}
		// Basic range checks based on sensor type
		if strings.Contains(p.SensorId, "Speed") && p.Value < 0 {
			return errors.New("invalid speed value")
		}
		if strings.Contains(p.SensorId, "Battery.Charge") && (p.Value < 0 || p.Value > 100) {
			return errors.New("invalid battery charge")
		}
	}
	return nil
}
