// San Francisco Bay Area - realistic EV fleet deployment zones
const SF_BAY_ZONES = [
    { name: 'Downtown SF', lat: 37.7749, lon: -122.4194 },
    { name: 'Mission District', lat: 37.7599, lon: -122.4148 },
    { name: 'SoMa', lat: 37.7786, lon: -122.3893 },
    { name: 'Marina', lat: 37.8043, lon: -122.4376 },
    { name: 'Financial District', lat: 37.7946, lon: -122.4014 },
    { name: 'Embarcadero', lat: 37.7955, lon: -122.3937 },
    { name: 'Oakland Downtown', lat: 37.8044, lon: -122.2712 },
    { name: 'Berkeley', lat: 37.8715, lon: -122.2730 },
    { name: 'Palo Alto', lat: 37.4419, lon: -122.1430 },
    { name: 'San Jose', lat: 37.3382, lon: -121.8863 },
];

// Track vehicle states for realistic movement
const vehicleStates = new Map<string, {
    zone: typeof SF_BAY_ZONES[0];
    lat: number;
    lon: number;
    speed: number;
    temp: number;
    lastUpdate: number;
}>();

export function generateDemoTelemetry() {
    // Generate consistent VIN (50 vehicles in fleet)
    const vehicleIndex = Math.floor(Math.random() * 50);
    const vin = `VIN${vehicleIndex.toString().padStart(3, '0')}`;

    // Get or initialize vehicle state
    let state = vehicleStates.get(vin);

    if (!state || Date.now() - state.lastUpdate > 60000) {
        // New vehicle or reset after 1 minute - assign to a random zone
        const zone = SF_BAY_ZONES[Math.floor(Math.random() * SF_BAY_ZONES.length)];
        state = {
            zone,
            lat: zone.lat + (Math.random() - 0.5) * 0.01, // ~0.5 mile radius
            lon: zone.lon + (Math.random() - 0.5) * 0.01,
            speed: Math.random() < 0.3 ? 0 : 20 + Math.random() * 40, // 30% stopped
            temp: 30 + Math.random() * 15, // 30-45°C normal range
            lastUpdate: Date.now(),
        };
    } else {
        // Simulate realistic movement
        const isMoving = state.speed > 5;

        if (isMoving) {
            // Move vehicle slightly (realistic speed-based displacement)
            const displacement = (state.speed / 3600) * 0.001; // approximate lat/lon change
            state.lat += (Math.random() - 0.5) * displacement;
            state.lon += (Math.random() - 0.5) * displacement;

            // Gradual speed changes
            state.speed += (Math.random() - 0.5) * 10;
            state.speed = Math.max(0, Math.min(80, state.speed)); // 0-80 mph
        } else {
            // Stopped vehicle - small chance to start moving
            if (Math.random() < 0.1) {
                state.speed = 15 + Math.random() * 15;
            }
        }

        // Temperature slowly changes with usage
        if (isMoving) {
            state.temp += (Math.random() - 0.3) * 2; // Slight warming when moving
        } else {
            state.temp -= 0.5; // Cooling when stopped
        }
        state.temp = Math.max(25, Math.min(65, state.temp)); // 25-65°C range

        state.lastUpdate = Date.now();
    }

    vehicleStates.set(vin, state);

    return {
        vin,
        lat: state.lat,
        lon: state.lon,
        speed: Math.round(state.speed * 10) / 10,
        temp: Math.round(state.temp * 10) / 10,
    };
}

export function generateDemoAlert() {
    const vehicleIndex = Math.floor(Math.random() * 50);
    const vin = `VIN${vehicleIndex.toString().padStart(3, '0')}`;

    const state = vehicleStates.get(vin);

    // Generate contextual alerts based on actual vehicle state
    const alerts = [];

    if (state && state.temp > 55) {
        alerts.push({
            type: 'BATTERY_OVERHEAT',
            message: `Battery temperature ${state.temp.toFixed(1)}°C exceeds safe limit`,
            value: state.temp,
        });
    }

    if (state && state.speed > 75) {
        alerts.push({
            type: 'HIGH_SPEED',
            message: `Vehicle speed ${state.speed.toFixed(1)} mph exceeds limit`,
            value: state.speed,
        });
    }

    // Random low tire pressure (not state-dependent)
    if (Math.random() < 0.1) {
        alerts.push({
            type: 'LOW_TIRE_PRESSURE',
            message: 'Tire pressure below 30 PSI',
            value: 25 + Math.random() * 5,
        });
    }

    // Occasional resolved alerts
    if (Math.random() < 0.2) {
        alerts.push({
            type: 'RESOLVED',
            message: 'Previous alert condition resolved',
            value: 0,
        });
    }

    // Return random alert from available ones, or generate a generic one
    const alert = alerts.length > 0
        ? alerts[Math.floor(Math.random() * alerts.length)]
        : {
            type: 'RESOLVED',
            message: 'All systems nominal',
            value: 0,
        };

    return {
        vehicle_id: vin,
        type: alert.type,
        message: alert.message,
        value: alert.value,
        timestamp: Date.now(),
    };
}
