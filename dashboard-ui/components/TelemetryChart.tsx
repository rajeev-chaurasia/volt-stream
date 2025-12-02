'use client';

import { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartDataPoint } from '@/lib/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TelemetryChartProps {
    data: ChartDataPoint[];
    label: string;
    color: string;
    max?: number;
    threshold?: number;
}

export default function TelemetryChart({ data, label, color, max = 100, threshold }: TelemetryChartProps) {
    const chartRef = useRef<ChartJS<'line'>>(null);

    // Take last 60 data points
    const displayData = data.slice(-60);

    const chartData = {
        labels: displayData.map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label,
                data: displayData.map(d => d.value),
                borderColor: color,
                backgroundColor: `${color}33`,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: true,
                tension: 0.4
            },
            ...(threshold ? [{
                label: 'Threshold',
                data: Array(displayData.length).fill(threshold),
                borderColor: '#f59e0b',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }] : [])
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#1e293b',
                titleColor: '#e2e8f0',
                bodyColor: '#e2e8f0',
                borderColor: '#475569',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                min: 0,
                max: Math.max(max, threshold || 0, 120), // Ensure chart shows all data
                grid: {
                    color: '#334155'
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        },
        animation: {
            duration: 0
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 shadow-lg">
            <h2 className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">{label}</h2>
            <div className="h-32">
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    );
}
