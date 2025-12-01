export function generateDemoTelemetry() {
    const baseLocations = [
        { lat: 37.7749, lon: -122.4194 }, // San Francisco
        { lat: 40.7128, lon: -74.0060 },  // New York
        { lat: 34.0522, lon: -118.2437 }, // Los Angeles
        { lat: 51.5074, lon: -0.1278 },   //London
        { lat: 35.6762, lon: 139.6503 },  // Tokyo
    ];

    const vehicle = baseLocations[Math.floor(Math.random() * baseLocations.length)];

    return {
        vin: `VIN${Math.floor(Math.random() * 50).toString().padStart(3, '0')}`,
        lat: vehicle.lat + (Math.random() - 0.5) * 0.05,
        lon: vehicle.lon + (Math.random() - 0.5) * 0.05,
        speed: 50 + Math.random() * 70,
        temp: 25 + Math.random() * 35,
    };
}

export function generateDemoAlert() {
    const types = ['BATTERY_OVERHEAT', 'LOW_TIRE_PRESSURE', 'HIGH_SPEED', 'RESOLVED'];
    const messages = {
        'BATTERY_OVERHEAT': 'Battery temperature exceeded 58°C',
        'LOW_TIRE_PRESSURE': 'Tire pressure below 30 PSI',
        'HIGH_SPEED': 'Vehicle speed exceeded safe limits',
        'RESOLVED': 'Alert condition resolved',
    };

    const type = types[Math.floor(Math.random() * types.length)];

    return {
        vehicle_id: `VIN${Math.floor(Math.random() * 50).toString().padStart(3, '0')}`,
        type,
        message: messages[type as keyof typeof messages],
        value: type === 'BATTERY_OVERHEAT' ? 60 + Math.random() * 10 :
            type === 'LOW_TIRE_PRESSURE' ? 25 + Math.random() * 5 :
                type === 'HIGH_SPEED' ? 120 + Math.random() * 30 : 0,
        timestamp: Date.now(),
    };
}
