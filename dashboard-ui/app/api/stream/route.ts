/**
 * Server-Sent Events (SSE) endpoint for real-time telemetry data
 * 
 * PRODUCTION MODE (Vercel):
 * - Uses simulated data from demo-data.ts
 * - Generates realistic SF Bay Area vehicle movements
 * - Zero external dependencies, works on free tier
 * 
 * LOCAL MODE:
 * - For local development, replace this with Kafka consumer
 * - See dashboard-ui/README.md for switching to real backend
 */

import { generateDemoTelemetry, generateDemoAlert } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            let isClosed = false;

            // Generate telemetry every 100ms (10 updates/second for smooth animation)
            const telemetryInterval = setInterval(() => {
                if (isClosed) return;

                try {
                    const data = generateDemoTelemetry();
                    const sseMessage = `event: telemetry\ndata: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(sseMessage));
                } catch (e) {
                    console.error('Telemetry error:', e);
                    isClosed = true;
                    clearAllIntervals();
                }
            }, 100);

            // Generate alerts every 5-15 seconds
            const alertInterval = setInterval(() => {
                if (isClosed) return;

                try {
                    // 40% chance of generating an alert
                    if (Math.random() > 0.6) {
                        const alert = generateDemoAlert();
                        const sseMessage = `event: alert\ndata: ${JSON.stringify(alert)}\n\n`;
                        controller.enqueue(encoder.encode(sseMessage));
                    }
                } catch (e) {
                    console.error('Alert error:', e);
                    isClosed = true;
                    clearAllIntervals();
                }
            }, 5000 + Math.random() * 10000);

            // Keepalive ping every 30 seconds
            const keepaliveInterval = setInterval(() => {
                if (!isClosed) {
                    try {
                        controller.enqueue(encoder.encode(': keepalive\n\n'));
                    } catch (e) {
                        console.error('Keepalive error:', e);
                        isClosed = true;
                        clearAllIntervals();
                    }
                }
            }, 30000);

            function clearAllIntervals() {
                clearInterval(telemetryInterval);
                clearInterval(alertInterval);
                clearInterval(keepaliveInterval);
            }

            // Cleanup on connection close
            return () => {
                isClosed = true;
                clearAllIntervals();
            };
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
