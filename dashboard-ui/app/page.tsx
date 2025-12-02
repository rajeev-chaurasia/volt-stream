'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import MetricsBar from '@/components/MetricsBar';
import TelemetryChart from '@/components/TelemetryChart';
import AlertFeed from '@/components/AlertFeed';
import { CHART_CONFIG, MAP_CONFIG } from '@/lib/constants';
import type { VehiclePosition, Alert, ChartDataPoint } from '@/lib/types';

const FleetMap = dynamic(() => import('@/components/FleetMap'), { ssr: false });

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Map<string, VehiclePosition>>(new Map());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [speedData, setSpeedData] = useState<ChartDataPoint[]>([]);
  const [tempData, setTempData] = useState<ChartDataPoint[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const eventCounterRef = useRef(0);
  const updateThrottleRef = useRef<number>(0);
  const chartUpdateRef = useRef<number>(0);

  // Production: Bounded collections prevent memory leaks
  const MAX_ALERTS = 100;
  const MAX_VEHICLES_DISPLAY = 1000;
  const VEHICLE_TIMEOUT = 60000; // Remove vehicles not seen in 60s

  useEffect(() => {
    const es = new EventSource('/api/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      console.log('Stream connected');
    };

    es.addEventListener('telemetry', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        eventCounterRef.current += 1;

        const now = Date.now();

        setVehicles(prev => {
          const next = new Map(prev);
          next.set(data.vin, {
            vin: data.vin,
            lat: data.lat,
            lon: data.lon,
            speed: data.speed,
            temp: data.temp,
            status: data.temp > MAP_CONFIG.CRITICAL_TEMP_THRESHOLD ? 'critical' : 'normal',
            lastUpdate: now
          });
          return next;
        });

        if (now - chartUpdateRef.current > CHART_CONFIG.UPDATE_THROTTLE_MS) {
          chartUpdateRef.current = now;
          setSpeedData(prev => [...prev.slice(-CHART_CONFIG.MAX_DATA_POINTS), { timestamp: now, value: data.speed }]);
          setTempData(prev => [...prev.slice(-CHART_CONFIG.MAX_DATA_POINTS), { timestamp: now, value: data.temp }]);
        }
      } catch (err) {
        console.error('Telemetry parse error:', err);
      }
    });

    es.addEventListener('alert', (e: MessageEvent) => {
      try {
        const alert: Alert = JSON.parse(e.data);
        // Production: Strict limit to prevent memory leak
        setAlerts(prev => [alert, ...prev].slice(0, MAX_ALERTS));
      } catch (err) {
        console.error('Alert parse error:', err);
      }
    });

    es.onerror = () => {
      setIsConnected(false);
      console.error('Stream connection lost');
    };

    const statsInterval = setInterval(() => {
      setEventCount(eventCounterRef.current);
      eventCounterRef.current = 0;
    }, 1000);

    // Production: Clean up stale vehicles every 30 seconds
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setVehicles(prev => {
        const next = new Map(prev);
        let removed = 0;
        for (const [vin, vehicle] of next.entries()) {
          if (now - vehicle.lastUpdate > VEHICLE_TIMEOUT) {
            next.delete(vin);
            removed++;
          }
        }
        if (removed > 0) {
          console.log(`Cleaned up ${removed} stale vehicles`);
        }
        return next;
      });
    }, 30000);

    return () => {
      es.close();
      clearInterval(statsInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const activeVehicles = vehicles.size;
  const avgSpeed = Array.from(vehicles.values()).reduce((sum, v) => sum + v.speed, 0) / (activeVehicles || 1);
  const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL').length;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header with Navigation */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-white">VOLTSTREAM</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-cyan-600 text-white text-sm font-medium rounded">
              Live Dashboard
            </span>
            <Link 
              href="/analytics" 
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm font-medium rounded transition"
            >
              Analytics →
            </Link>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Real-time Fleet Monitoring
        </div>
      </header>

      {/* Metrics Bar */}
      <MetricsBar
        activeVehicles={activeVehicles}
        avgSpeed={avgSpeed}
        criticalAlerts={criticalAlerts}
        eventsPerSecond={eventCount}
        isConnected={isConnected}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Map */}
        <div className="flex-1 relative">
          <FleetMap vehicles={Array.from(vehicles.values())} />
        </div>

        {/* Right: Charts & Alerts */}
        <div className="w-96 flex flex-col bg-slate-800/50 backdrop-blur border-l border-slate-700">
          {/* Charts */}
          <div className="h-1/2 p-4 space-y-4 overflow-y-auto border-b border-slate-700">
            <TelemetryChart
              data={speedData}
              label="Speed (km/h)"
              color="#22d3ee"
              max={100}
            />
            <TelemetryChart
              data={tempData}
              label="Temperature (°C)"
              color="#f87171"
              max={80}
              threshold={58}
            />
          </div>

          {/* Alerts */}
          <div className="h-1/2">
            <AlertFeed alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
}
