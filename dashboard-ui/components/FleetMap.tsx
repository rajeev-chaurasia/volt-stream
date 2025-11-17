'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MAP_CONFIG } from '@/lib/constants';
import type { VehiclePosition } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface FleetMapProps {
    vehicles: VehiclePosition[];
}

function VehicleMarkers({ vehicles }: FleetMapProps) {
    const map = useMap();

    useEffect(() => {
        if (vehicles.length > 0) {
            const bounds = vehicles.map(v => [v.lat, v.lon] as [number, number]);
            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            }
        }
    }, [vehicles.length, map]);

    return (
        <>
            {vehicles.map(vehicle => (
                <CircleMarker
                    key={vehicle.vin}
                    center={[vehicle.lat, vehicle.lon]}
                    radius={MAP_CONFIG.MARKER_RADIUS}
                    pathOptions={{
                        fillColor: vehicle.status === 'critical' ? '#ef4444' : '#3b82f6',
                        fillOpacity: 0.9,
                        color: vehicle.status === 'critical' ? '#fef2f2' : '#dbeafe',
                        weight: 2
                    }}
                >
                    <Popup>
                        <div className="text-xs font-mono">
                            <div className="font-bold">{vehicle.vin}</div>
                            <div>Speed: {vehicle.speed.toFixed(1)} km/h</div>
                            <div>Temp: {vehicle.temp.toFixed(1)}°C</div>
                            <div className={vehicle.status === 'critical' ? 'text-red-500 font-bold' : ''}>
                                Status: {vehicle.status.toUpperCase()}
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
}

export default function FleetMap({ vehicles }: FleetMapProps) {
    return (
        <MapContainer
            center={[MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lng]}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            className="h-full w-full"
            zoomControl={true}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            />
            <VehicleMarkers vehicles={vehicles} />
        </MapContainer>
    );
}
