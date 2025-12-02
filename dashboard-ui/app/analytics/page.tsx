'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  summary?: {
    total_vehicles: number;
    total_events: number;
    total_alerts: number;
    avg_temp: number;
    avg_speed: number;
  };
  speedStats?: Array<{
    timestamp: string;
    avg_speed: number;
  }>;
  alertFrequency?: Array<{
    type: string;
    count: number;
  }>;
  alertDistribution?: Array<{
    hour: string;
    count: number;
  }>;
  tirePressure?: any[];
  timestamp: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('-1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = async (isManualRefresh = false) => {
    try {
      setError(null);
      // Use isRefreshing for manual refresh when data exists
      if (isManualRefresh && data) {
        setIsRefreshing(true);
      }
      
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&type=all`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Loading Modal Overlay (only shows during refresh, not initial load)
  const LoadingModal = () => (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="bg-slate-800/95 border border-cyan-500 rounded-lg p-4 shadow-2xl pointer-events-auto backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 className="text-sm font-semibold text-white">Refreshing...</h3>
            <p className="text-slate-400 text-xs">Loading data</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Initial loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-800 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h2 className="text-red-400 text-xl font-bold mb-2">Analytics Error</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => fetchAnalytics()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const speedStats = data?.speedStats || [];
  const alertFrequency = data?.alertFrequency || [];
  const alertDistribution = data?.alertDistribution || [];

  // Prepare chart data
  const speedChartData = {
    labels: speedStats.map(s => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Average Speed (km/h)',
        data: speedStats.map(s => s.avg_speed),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const alertFreqChartData = {
    labels: alertFrequency.map(a => a.type),
    datasets: [
      {
        label: 'Alert Count',
        data: alertFrequency.map(a => a.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  const alertDistChartData = {
    labels: alertDistribution.map(a => new Date(a.hour).toLocaleTimeString()),
    datasets: [
      {
        label: 'Alerts per Hour',
        data: alertDistribution.map(a => a.count),
        backgroundColor: 'rgba(248, 113, 113, 0.8)',
      },
    ],
  };

  const alertTypePieData = {
    labels: alertFrequency.map(a => a.type),
    datasets: [
      {
        data: alertFrequency.map(a => a.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Loading indicator during refresh */}
      {isRefreshing && <LoadingModal />}
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-cyan-400 hover:text-cyan-300 transition font-semibold"
            >
              ← Live Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="-1h">Last Hour</option>
              <option value="-6h">Last 6 Hours</option>
              <option value="-24h">Last 24 Hours</option>
              <option value="-7d">Last 7 Days</option>
              <option value="-30d">Last 30 Days</option>
            </select>

            {/* Auto Refresh Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 rounded transition text-sm font-medium"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total Vehicles</div>
            <div className="text-3xl font-bold text-cyan-400">
              {summary?.total_vehicles.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total Events</div>
            <div className="text-3xl font-bold text-blue-400">
              {summary?.total_events.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Total Alerts</div>
            <div className="text-3xl font-bold text-red-400">
              {summary?.total_alerts.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Avg Temperature</div>
            <div className="text-3xl font-bold text-orange-400">
              {summary?.avg_temp.toFixed(1) || 0}°C
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-1">Avg Speed</div>
            <div className="text-3xl font-bold text-green-400">
              {summary?.avg_speed.toFixed(1) || 0} km/h
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speed Over Time */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Speed Over Time</h3>
            {speedStats.length > 0 ? (
              <Line
                data={speedChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                  },
                }}
                height={250}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No speed data available
              </div>
            )}
          </div>

          {/* Alert Frequency by Type - Pie Chart */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Alert Frequency by Type</h3>
            {alertFrequency.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                <Pie
                  data={alertTypePieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: { 
                          color: '#94a3b8',
                          font: { size: 12 },
                          padding: 15,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No alert data available
              </div>
            )}
          </div>

          {/* Alert Distribution Over Time - Line Chart */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Alert Timeline</h3>
            {alertDistribution.length > 0 ? (
              <Line
                data={{
                  labels: alertDistribution.slice(-50).map(a => new Date(a.hour).toLocaleTimeString()),
                  datasets: [
                    {
                      label: 'Alerts per Hour',
                      data: alertDistribution.slice(-50).map(a => a.count),
                      borderColor: 'rgba(248, 113, 113, 0.8)',
                      backgroundColor: 'rgba(248, 113, 113, 0.1)',
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                  },
                }}
                height={250}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No timeline data available
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-slate-500 text-sm">
          Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
          {autoRefresh && ' • Auto-refreshing every 60 seconds'}
        </div>
      </main>
    </div>
  );
}
