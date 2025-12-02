import { InfluxDB } from '@influxdata/influxdb-client-browser';

/**
 * InfluxDB Analytics Client
 * 
 * Queries historical telemetry data with:
 * - Result limits to prevent memory issues
 * - Time-window aggregation (5-minute buckets)
 * - 10 second query timeout
 * - Graceful error handling
 */

const INFLUX_URL = process.env.NEXT_PUBLIC_INFLUXDB_URL || 'http://localhost:18086';
const INFLUX_TOKEN = process.env.NEXT_PUBLIC_INFLUXDB_TOKEN || 'my-super-secret-auth-token';
const INFLUX_ORG = process.env.NEXT_PUBLIC_INFLUXDB_ORG || 'voltstream';
const INFLUX_BUCKET = process.env.NEXT_PUBLIC_INFLUXDB_BUCKET || 'telemetry';

// Query configuration
const QUERY_TIMEOUT = 10000; // 10 seconds
const MAX_DATA_POINTS = 1000; // Limit result size

// Initialize InfluxDB client
const influxDB = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
  timeout: QUERY_TIMEOUT,
});

const queryApi = influxDB.getQueryApi(INFLUX_ORG);

export interface SpeedStatistic {
  timestamp: string;
  avg_speed: number;
  max_speed: number;
  min_speed: number;
}

export interface AlertFrequency {
  type: string;
  count: number;
}

export interface AlertDistribution {
  hour: string;
  count: number;
}

export interface SummaryStats {
  total_vehicles: number;
  total_events: number;
  total_alerts: number;
  avg_temp: number;
  avg_speed: number;
}

/**
 * Get aggregated speed statistics over time
 * Uses 5-minute windows to reduce data points
 */
export async function getSpeedStatistics(timeRange: string = '-1h'): Promise<SpeedStatistic[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry" and r._field == "value")
      |> filter(fn: (r) => r.sensor_id =~ /Speed/)
      |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
      |> group(columns: ["_time"])
      |> mean()
      |> limit(n: ${MAX_DATA_POINTS})
      |> yield(name: "speed_stats")
  `;

  const results: SpeedStatistic[] = [];
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: any) {
        const record = tableMeta.toObject(row);
        results.push({
          timestamp: record._time,
          avg_speed: record._value || 0,
          max_speed: record._value || 0,
          min_speed: record._value || 0,
        });
      },
      error(error: Error) {
        console.error('Speed statistics query error:', error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

/**
 * Get alert frequency by type
 * Aggregates over last 24 hours
 */
export async function getAlertFrequency(timeRange: string = '-24h'): Promise<AlertFrequency[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "alerts")
      |> filter(fn: (r) => r._field == "value")
      |> group(columns: ["level"])
      |> count()
      |> limit(n: 20)
      |> yield(name: "alert_frequency")
  `;

  const results: AlertFrequency[] = [];
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: any) {
        const record = tableMeta.toObject(row);
        results.push({
          type: record.level || 'UNKNOWN',
          count: record._value || 0,
        });
      },
      error(error: Error) {
        console.error('Alert frequency query error:', error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

/**
 * Get alert distribution by time (hourly buckets)
 * Shows alert patterns over last 7 days
 */
export async function getAlertDistribution(timeRange: string = '-7d'): Promise<AlertDistribution[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "alerts")
      |> aggregateWindow(every: 1h, fn: count, createEmpty: false)
      |> group(columns: ["_time"])
      |> sum()
      |> limit(n: 168)
      |> yield(name: "alert_distribution")
  `;

  const results: AlertDistribution[] = [];
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: any) {
        const record = tableMeta.toObject(row);
        results.push({
          hour: record._time,
          count: record._value || 0,
        });
      },
      error(error: Error) {
        console.error('Alert distribution query error:', error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

/**
 * Get summary statistics (cached aggressively)
 * Quick overview metrics
 */
export async function getSummaryStats(timeRange: string = '-1h'): Promise<SummaryStats> {
  const query = `
    vehicles = from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry")
      |> group(columns: ["vin"])
      |> distinct(column: "vin")
      |> count()
      |> yield(name: "vehicles")
    
    events = from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry")
      |> count()
      |> yield(name: "events")
    
    alerts = from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "alerts")
      |> count()
      |> yield(name: "alerts")
    
    avg_temp = from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry" and r._field == "value")
      |> filter(fn: (r) => r.sensor_id =~ /Temperature/)
      |> mean()
      |> yield(name: "avg_temp")
    
    avg_speed = from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry" and r._field == "value")
      |> filter(fn: (r) => r.sensor_id =~ /Speed/)
      |> mean()
      |> yield(name: "avg_speed")
  `;

  const stats: Partial<SummaryStats> = {
    total_vehicles: 0,
    total_events: 0,
    total_alerts: 0,
    avg_temp: 0,
    avg_speed: 0,
  };
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: any) {
        const record = tableMeta.toObject(row);
        const resultName = record.result as string;
        
        switch (resultName) {
          case 'vehicles':
            stats.total_vehicles = record._value || 0;
            break;
          case 'events':
            stats.total_events = record._value || 0;
            break;
          case 'alerts':
            stats.total_alerts = record._value || 0;
            break;
          case 'avg_temp':
            stats.avg_temp = record._value || 0;
            break;
          case 'avg_speed':
            stats.avg_speed = record._value || 0;
            break;
        }
      },
      error(error: Error) {
        console.error('Summary stats query error:', error);
        reject(error);
      },
      complete() {
        resolve(stats as SummaryStats);
      },
    });
  });
}

/**
 * Get tire pressure statistics (if available)
 * Useful for predictive maintenance
 */
export async function getTirePressureStats(timeRange: string = '-24h'): Promise<any[]> {
  const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: ${timeRange})
      |> filter(fn: (r) => r._measurement == "telemetry" and r._field == "value")
      |> filter(fn: (r) => r.sensor_id =~ /Pressure/)
      |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
      |> limit(n: ${MAX_DATA_POINTS})
      |> yield(name: "tire_pressure")
  `;

  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row: string[], tableMeta: any) {
        const record = tableMeta.toObject(row);
        results.push({
          timestamp: record._time,
          pressure: record._value || 0,
          vin: record.vin || 'UNKNOWN',
        });
      },
      error(error: Error) {
        console.error('Tire pressure query error:', error);
        // Don't reject, just return empty results (field might not exist)
        resolve([]);
      },
      complete() {
        resolve(results);
      },
    });
  });
}
