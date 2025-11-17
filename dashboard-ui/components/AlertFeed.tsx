'use client';

import type { Alert } from '@/lib/types';

interface AlertFeedProps {
    alerts: Alert[];
}

export default function AlertFeed({ alerts }: AlertFeedProps) {
    const getAlertStyle = (type: Alert['type']) => {
        switch (type) {
            case 'CRITICAL':
                return 'border-red-500 bg-red-500/10 text-red-400';
            case 'WARNING':
                return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
            case 'RESOLVED':
                return 'border-green-500 bg-green-500/10 text-green-400';
            default:
                return 'border-slate-500 bg-slate-500/10 text-slate-400';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50">
            {/* Header */}
            <div className="p-3 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                <h2 className="text-slate-300 text-sm font-bold uppercase tracking-wider">
                    Notification Center
                </h2>
                {alerts.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {alerts.filter(a => a.type === 'CRITICAL').length}
                    </span>
                )}
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs">
                {alerts.length === 0 ? (
                    <div className="text-slate-600 text-center italic mt-4">No active alerts</div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`border-l-4 p-2 rounded ${getAlertStyle(alert.type)} transition-all duration-200`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold">{alert.type}</span>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-slate-300">{alert.vehicle_id}</div>
                            <div className="text-[11px] text-slate-400 mt-1">{alert.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                Value: {alert.value.toFixed(1)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
