import { NextRequest } from 'next/server';
import { KAFKA_CONFIG, USE_DEMO_MODE } from '@/lib/constants';
import KafkaConsumerPool from '@/lib/kafka-pool';
import { generateTelemetryData, generateAlertData } from '@/lib/demo-data';

const protoRoot = require('../../../lib/telemetry');
const TelemetryBatch = protoRoot.telemetry.TelemetryBatch;

/**
 * Real-time Telemetry Stream Endpoint
 * 
 * Handles Server-Sent Events (SSE) connections using a shared Kafka consumer.
 * Multiple clients can connect simultaneously and receive the same telemetry stream.
 * 
 * Features:
 * - Single Kafka consumer serves all connections (singleton pattern)
 * - Messages broadcast to all connected clients
 * - Automatic cleanup when clients disconnect
 * - Keepalive messages every 30 seconds
 */

export async function GET(request: NextRequest) {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encoder = new TextEncoder();
    
    // Demo Mode: Generate simulated data without Kafka
    if (USE_DEMO_MODE) {
        console.log(`[SSE-DEMO] Starting demo stream for ${clientId}`);
        
        const stream = new ReadableStream({
            async start(controller) {
                let isClosed = false;
                
                // Send telemetry data every 500ms
                const telemetryInterval = setInterval(() => {
                    if (isClosed) return;
                    
                    try {
                        const data = generateTelemetryData();
                        controller.enqueue(
                            encoder.encode(`event: telemetry\ndata: ${JSON.stringify(data)}\n\n`)
                        );
                    } catch (e) {
                        console.error(`[SSE-DEMO] Error sending telemetry:`, e);
                    }
                }, 500);
                
                // Send alerts every 5 seconds
                const alertInterval = setInterval(() => {
                    if (isClosed) return;
                    
                    try {
                        if (Math.random() > 0.7) { // 30% chance of alert
                            const alert = generateAlertData();
                            controller.enqueue(
                                encoder.encode(`event: alert\ndata: ${JSON.stringify(alert)}\n\n`)
                            );
                        }
                    } catch (e) {
                        console.error(`[SSE-DEMO] Error sending alert:`, e);
                    }
                }, 5000);
                
                // Keepalive every 30 seconds
                const keepaliveInterval = setInterval(() => {
                    if (!isClosed) {
                        try {
                            controller.enqueue(encoder.encode(': keepalive\n\n'));
                        } catch (e) {
                            console.error(`[SSE-DEMO] Keepalive error:`, e);
                        }
                    }
                }, 30000);
                
                // Handle disconnect
                request.signal.addEventListener('abort', () => {
                    console.log(`[SSE-DEMO] Client ${clientId} disconnected`);
                    isClosed = true;
                    clearInterval(telemetryInterval);
                    clearInterval(alertInterval);
                    clearInterval(keepaliveInterval);
                });
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
    
    // Real Mode: Use Kafka consumer pool
    const pool = KafkaConsumerPool.getInstance();

    const stream = new ReadableStream({
        async start(controller) {
            let isClosed = false;
            console.log(`[SSE] Starting stream for ${clientId}`);

            // Keepalive interval
            const keepaliveInterval = setInterval(() => {
                if (!isClosed) {
                    try {
                        controller.enqueue(encoder.encode(': keepalive\n\n'));
                    } catch (e) {
                        console.error(`[SSE] Keepalive error for ${clientId}:`, e);
                        isClosed = true;
                    }
                }
            }, 30000);

            try {
                // Custom controller wrapper for processing messages
                const wrappedController = {
                    enqueue: (chunk: Uint8Array) => {
                        if (isClosed) return;

                        try {
                            const message = new TextDecoder().decode(chunk);
                            
                            // Process telemetry messages with protobuf decoding
                            if (message.startsWith('event: telemetry\ndata: ')) {
                                const dataStart = message.indexOf('data: ') + 6;
                                const dataEnd = message.indexOf('\n\n', dataStart);
                                const rawData = message.substring(dataStart, dataEnd);
                                
                                try {
                                    // Try to decode as protobuf if it's a Buffer
                                    const buffer = Buffer.from(rawData, 'base64');
                                    const batch = TelemetryBatch.decode(buffer);
                                    
                                    const sensorData: any = { vin: batch.vehicleId };
                                    batch.points.forEach((point: any) => {
                                        const sensorId = point.sensorId;
                                        if (sensorId.includes('Latitude')) sensorData.lat = point.value;
                                        else if (sensorId.includes('Longitude')) sensorData.lon = point.value;
                                        else if (sensorId.includes('Speed')) sensorData.speed = point.value;
                                        else if (sensorId.includes('Temperature')) sensorData.temp = point.value;
                                    });

                                    if (sensorData.lat && sensorData.lon) {
                                        controller.enqueue(
                                            encoder.encode(`event: telemetry\ndata: ${JSON.stringify(sensorData)}\n\n`)
                                        );
                                    }
                                } catch (decodeErr) {
                                    // If protobuf decode fails, pass through as-is
                                    controller.enqueue(chunk);
                                }
                            } else {
                                // Pass through other events (alerts, errors, etc.)
                                controller.enqueue(chunk);
                            }
                        } catch (err) {
                            console.error(`[SSE] Message processing error for ${clientId}:`, err);
                        }
                    },
                    close: () => controller.close(),
                    error: (err: any) => controller.error(err),
                } as ReadableStreamDefaultController;

                // Register with pool
                await pool.addClient(
                    clientId,
                    wrappedController as any,
                    [KAFKA_CONFIG.TOPIC, KAFKA_CONFIG.ALERT_TOPIC]
                );

                // Handle client disconnect
                request.signal.addEventListener('abort', () => {
                    console.log(`[SSE] Client ${clientId} disconnected`);
                    isClosed = true;
                    clearInterval(keepaliveInterval);
                    pool.removeClient(clientId);
                });

            } catch (error) {
                console.error(`[SSE] Stream error for ${clientId}:`, error);
                isClosed = true;
                clearInterval(keepaliveInterval);
                pool.removeClient(clientId);
                controller.enqueue(
                    encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
                );
            }
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
