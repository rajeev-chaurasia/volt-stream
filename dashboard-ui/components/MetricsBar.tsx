'use client';

interface MetricsBarProps {
    activeVehicles: number;
    avgSpeed: number;
    criticalAlerts: number;
    eventsPerSecond: number;
    isConnected: boolean;
}

export default function MetricsBar({
    activeVehicles,
    avgSpeed,
    criticalAlerts,
    eventsPerSecond,
    isConnected
}: MetricsBarProps) {
    return (
        <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
                <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    VOLTSTREAM
                </h1>
            </div>

            {/* Metrics */}
            <div className="flex gap-6 text-sm font-mono">
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">EVENTS / SEC</span>
                    <span className="text-cyan-400 text-xl font-bold">{eventsPerSecond}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">ACTIVE VEHICLES</span>
                    <span className="text-emerald-400 text-xl font-bold">{activeVehicles}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">AVG SPEED</span>
                    <span className="text-blue-400 text-xl font-bold">{avgSpeed.toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs">CRITICAL</span>
                    <span className="text-red-400 text-xl font-bold">{criticalAlerts}</span>
                </div>
            </div>
        </header>
    );
}
