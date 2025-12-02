/**
 * Demo Mode Data Generator
 * 
 * Generates simulated telemetry and analytics data when USE_DEMO_MODE=true
 * Used for demos and testing without requiring backend infrastructure
 */

// Generate random value within range
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Generate random integer within range
function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}

// Generate vehicle positions in San Francisco area
function generateVehiclePosition(index: number) {
  const centerLat = 37.7749;
  const centerLng = -122.4194;
  const spread = 0.05; // ~5km radius
  
  return {
    lat: centerLat + (Math.random() - 0.5) * spread,
    lon: centerLng + (Math.random() - 0.5) * spread,
  };
}

// Generate telemetry data point
export function generateTelemetryData() {
  const vehicleId = `DEMO-${randomInt(1, 100)}`;
  const position = generateVehiclePosition(parseInt(vehicleId.split('-')[1]));
  
  return {
    vin: vehicleId,
    lat: position.lat,
    lon: position.lon,
    speed: randomInRange(30, 120),
    temp: randomInRange(20, 65),
  };
}

// Generate alert data
export function generateAlertData() {
  const alertTypes = [
    'BATTERY_OVERHEAT',
    'TIRE_PRESSURE_LOW',
    'SPEED_LIMIT_EXCEEDED',
    'BATTERY_CRITICAL',
  ];
  
  return {
    type: alertTypes[randomInt(0, alertTypes.length)],
    vehicleId: `DEMO-${randomInt(1, 100)}`,
    severity: ['WARNING', 'CRITICAL'][randomInt(0, 2)],
    message: 'Demo alert generated',
    timestamp: new Date().toISOString(),
  };
}

// Generate summary statistics
export function generateSummaryStats() {
  return {
    total_vehicles: randomInt(80, 100),
    total_events: randomInt(10000, 50000),
    total_alerts: randomInt(50, 200),
    avg_temp: randomInRange(35, 45),
    avg_speed: randomInRange(60, 80),
  };
}

// Generate speed statistics over time
export function generateSpeedStats(hours: number = 24) {
  const stats = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 50; // 50 data points
  
  for (let i = 0; i < 50; i++) {
    stats.push({
      timestamp: new Date(now - (49 - i) * interval).toISOString(),
      avg_speed: randomInRange(50, 90),
    });
  }
  
  return stats;
}

// Generate alert frequency by type
export function generateAlertFrequency() {
  return [
    { type: 'BATTERY_OVERHEAT', count: randomInt(20, 50) },
    { type: 'TIRE_PRESSURE_LOW', count: randomInt(10, 30) },
    { type: 'SPEED_LIMIT_EXCEEDED', count: randomInt(15, 40) },
    { type: 'BATTERY_CRITICAL', count: randomInt(5, 15) },
  ];
}

// Generate alert distribution over time
export function generateAlertDistribution(hours: number = 24) {
  const distribution = [];
  const now = Date.now();
  const interval = 60 * 60 * 1000; // 1 hour
  
  for (let i = 0; i < Math.min(hours, 168); i++) {
    distribution.push({
      hour: new Date(now - (hours - i) * interval).toISOString(),
      count: randomInt(5, 20),
    });
  }
  
  return distribution;
}

// Generate tire pressure statistics
export function generateTirePressureStats() {
  return [
    { vehicle_id: 'DEMO-1', avg_pressure: randomInRange(30, 35) },
    { vehicle_id: 'DEMO-2', avg_pressure: randomInRange(30, 35) },
    { vehicle_id: 'DEMO-3', avg_pressure: randomInRange(30, 35) },
  ];
}

// Parse time range to hours
export function parseTimeRangeToHours(timeRange: string): number {
  const value = parseInt(timeRange.slice(1, -1));
  const unit = timeRange.slice(-1);
  
  switch (unit) {
    case 'h':
      return value;
    case 'd':
      return value * 24;
    default:
      return 1;
  }
}
