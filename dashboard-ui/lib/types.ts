// Type definitions for VoltStream telemetry data

export interface TelemetryPoint {
    sensor_id: string;
    value: number;
}

export interface TelemetryBatch {
    vehicle_id: string;
    timestamp: number;
    points: TelemetryPoint[];
}

export interface VehiclePosition {
    vin: string;
    lat: number;
    lon: number;
    speed: number;
    temp: number;
    status: 'normal' | 'critical';
    lastUpdate: number;
}

export interface Alert {
    vehicle_id: string;
    type: 'CRITICAL' | 'WARNING' | 'RESOLVED';
    message: string;
    value: number;
    timestamp: number;
}

export interface ChartDataPoint {
    timestamp: number;
    value: number;
}

export interface DashboardMetrics {
    activeVehicles: number;
    avgSpeed: number;
    criticalAlerts: number;
    eventsPerSecond: number;
}
