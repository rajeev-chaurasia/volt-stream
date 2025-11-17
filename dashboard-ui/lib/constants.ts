// Dashboard Configuration Constants

export const KAFKA_CONFIG = {
  BROKER: process.env.KAFKA_BROKER || 'localhost:19092',
  TOPIC: process.env.KAFKA_TOPIC || 'telemetry-raw',
  ALERT_TOPIC: process.env.KAFKA_ALERT_TOPIC || 'telemetry-alerts',
  CONSUMER_GROUP: 'nextjs-dashboard-v6',
} as const;

export const STREAM_CONFIG = {
  MAX_ALERTS: 50,
  MAX_VEHICLE_AGE_MS: 5000,
  CLEANUP_INTERVAL_MS: 2000,
  STREAM_UPDATE_INTERVAL_MS: 200,
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 37.7749, lng: -122.4194 } as const,
  DEFAULT_ZOOM: 12,
  MARKER_RADIUS: 8,
  CRITICAL_TEMP_THRESHOLD: 58.0,
} as const;

export const CHART_CONFIG = {
  UPDATE_THROTTLE_MS: 500,
  MAX_DATA_POINTS: 20,
} as const;

export const SENSOR_IDS = {
  SPEED: 'Vehicle.Speed',
  BATTERY_TEMP: 'Vehicle.Powertrain.TractionBattery.Temperature.Average',
  TIRE_PRESSURE: 'Vehicle.Chassis.Axle.Row1.Wheel.Left.Tire.Pressure',
  LATITUDE: 'Vehicle.CurrentLocation.Latitude',
  LONGITUDE: 'Vehicle.CurrentLocation.Longitude',
} as const;
