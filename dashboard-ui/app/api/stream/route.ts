import { Kafka, CompressionTypes, CompressionCodecs } from 'kafkajs';
// @ts-ignore
import { SnappyCodec } from 'kafkajs-snappy';
import { KAFKA_CONFIG, STREAM_CONFIG } from '@/lib/constants';

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

const kafka = new Kafka({
    clientId: 'voltstream-dashboard',
    brokers: [KAFKA_CONFIG.BROKER],
});

const telemetryProto = require('@/lib/telemetry.js');

let consumer: any = null;
let isConsumerRunning = false;
let consumerPromise: Promise<void> | null = null;

const latestVehicleData = new Map<string, any>();
const latestAlerts: any[] = [];

async function startKafkaConsumer() {
    if (isConsumerRunning) {
        return consumerPromise;
    }
    
    if (consumerPromise) {
        return consumerPromise;
    }

    consumerPromise = (async () => {
        try {
            consumer = kafka.consumer({ 
                groupId: KAFKA_CONFIG.CONSUMER_GROUP,
                sessionTimeout: 30000,
                heartbeatInterval: 3000,
                rebalanceTimeout: 60000
            });
            
            await consumer.connect();
            await consumer.subscribe({
                topics: [KAFKA_CONFIG.TOPIC, KAFKA_CONFIG.ALERT_TOPIC],
                fromBeginning: false
            });

            isConsumerRunning = true;
            console.log('[Kafka] Consumer connected to', KAFKA_CONFIG.BROKER);

            setInterval(() => {
                const now = Date.now();
                const staleVehicles: string[] = [];
                for (const [vin, data] of latestVehicleData.entries()) {
                    if (now - data.timestamp > STREAM_CONFIG.MAX_VEHICLE_AGE_MS) {
                        staleVehicles.push(vin);
                    }
                }
                staleVehicles.forEach(vin => latestVehicleData.delete(vin));
                if (staleVehicles.length > 0) {
                    console.log(`[Cleanup] Removed ${staleVehicles.length} stale vehicles, ${latestVehicleData.size} active`);
                }
            }, STREAM_CONFIG.CLEANUP_INTERVAL_MS);

            await consumer.run({
                eachMessage: async ({ topic, message }: any) => {
                    try {
                        if (topic === KAFKA_CONFIG.TOPIC) {
                            const batch = telemetryProto.telemetry.TelemetryBatch.decode(message.value);
                            const batchObj = telemetryProto.telemetry.TelemetryBatch.toObject(batch, {
                                longs: Number,
                                enums: String,
                                bytes: String,
                            });

                            let lat = 0, lon = 0, speed = 0, temp = 0;
                            if (batchObj.points) {
                                batchObj.points.forEach((p: any) => {
                                    if (p.sensorId?.includes('Latitude')) lat = p.value;
                                    if (p.sensorId?.includes('Longitude')) lon = p.value;
                                    if (p.sensorId?.includes('Speed')) speed = p.value;
                                    if (p.sensorId?.includes('Temperature')) temp = p.value;
                                });
                            }

                            if (lat && lon) {
                                latestVehicleData.set(batchObj.vehicleId, {
                                    vin: batchObj.vehicleId,
                                    lat,
                                    lon,
                                    speed,
                                    temp,
                                    timestamp: Date.now()
                                });
                                
                                if (latestVehicleData.size % 100 === 0) {
                                    console.log(`[Kafka] Tracking ${latestVehicleData.size} vehicles`);
                                }
                            }
                        } else if (topic === KAFKA_CONFIG.ALERT_TOPIC) {
                            const alert = JSON.parse(message.value.toString());
                            latestAlerts.unshift(alert);
                            if (latestAlerts.length > STREAM_CONFIG.MAX_ALERTS) {
                                latestAlerts.pop();
                            }
                        }
                    } catch (error) {
                        console.error('[Kafka] Message processing error:', error);
                    }
                },
            });
        } catch (error) {
            console.error('[Kafka] Consumer error:', error);
            isConsumerRunning = false;
            consumerPromise = null;
            throw error;
        }
    })();
    
    return consumerPromise;
}

startKafkaConsumer().catch(console.error);

export async function GET() {
    const encoder = new TextEncoder();
    startKafkaConsumer().catch(console.error);

    const stream = new ReadableStream({
        start(controller) {
            let isClosed = false;
            const sentVehicles = new Set<string>();
            let lastAlertCount = 0;

            const sendInterval = setInterval(() => {
                if (isClosed) {
                    clearInterval(sendInterval);
                    return;
                }

                try {
                    let sent = 0;
                    for (const [vin, data] of latestVehicleData.entries()) {
                        if (isClosed) break;
                        
                        if (Date.now() - data.timestamp < 3000) {
                            try {
                                controller.enqueue(
                                    encoder.encode(`event: telemetry\ndata: ${JSON.stringify(data)}\n\n`)
                                );
                                sent++;
                            } catch (e) {
                                isClosed = true;
                                break;
                            }
                        }
                    }

                    if (!isClosed && latestAlerts.length > lastAlertCount) {
                        const newAlerts = latestAlerts.slice(0, latestAlerts.length - lastAlertCount);
                        for (const alert of newAlerts) {
                            try {
                                controller.enqueue(
                                    encoder.encode(`event: alert\ndata: ${JSON.stringify(alert)}\n\n`)
                                );
                            } catch (e) {
                                isClosed = true;
                                break;
                            }
                        }
                        lastAlertCount = latestAlerts.length;
                    }
                } catch (e) {
                    console.error('[SSE] Send error:', e);
                    isClosed = true;
                }
                
                if (isClosed) {
                    clearInterval(sendInterval);
                    clearInterval(keepaliveInterval);
                }
            }, STREAM_CONFIG.STREAM_UPDATE_INTERVAL_MS);

            const keepaliveInterval = setInterval(() => {
                if (!isClosed) {
                    try {
                        controller.enqueue(encoder.encode(': keepalive\n\n'));
                    } catch (e) {
                        isClosed = true;
                        clearInterval(sendInterval);
                        clearInterval(keepaliveInterval);
                    }
                }
            }, 30000);

            return () => {
                isClosed = true;
                clearInterval(sendInterval);
                clearInterval(keepaliveInterval);
                console.log('[SSE] Client disconnected');
            };
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
