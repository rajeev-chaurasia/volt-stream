import { Kafka, Consumer } from 'kafkajs';
import { KAFKA_CONFIG } from './constants';

/**
 * Kafka Consumer Pool
 * 
 * Shares a single Kafka consumer across multiple SSE connections.
 * This reduces resource usage and keeps load on Kafka low.
 * 
 * Features:
 * - One consumer for all connections
 * - Automatic reconnection on failure
 * - Clean shutdown handling
 * - Broadcasts messages to all connected clients
 */

interface ConsumerClient {
  id: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  topics: Set<string>;
}

class KafkaConsumerPool {
  private static instance: KafkaConsumerPool;
  private kafka: Kafka;
  private consumer: Consumer | null = null;
  private clients: Map<string, ConsumerClient> = new Map();
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'voltstream-dashboard-pool',
      brokers: [KAFKA_CONFIG.BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  static getInstance(): KafkaConsumerPool {
    if (!KafkaConsumerPool.instance) {
      KafkaConsumerPool.instance = new KafkaConsumerPool();
    }
    return KafkaConsumerPool.instance;
  }

  async addClient(
    clientId: string,
    controller: ReadableStreamDefaultController,
    topics: string[]
  ): Promise<void> {
    const client: ConsumerClient = {
      id: clientId,
      controller,
      encoder: new TextEncoder(),
      topics: new Set(topics),
    };

    this.clients.set(clientId, client);
    console.log(`[Kafka Pool] Client ${clientId} added. Total clients: ${this.clients.size}`);

    // Initialize consumer if this is the first client
    if (!this.isConnected && !this.isConnecting) {
      await this.connect();
    }

    // Send welcome message
    try {
      controller.enqueue(
        client.encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ clientId, clients: this.clients.size })}\n\n`
        )
      );
    } catch (err) {
      console.error(`[Kafka Pool] Failed to send welcome message to ${clientId}:`, err);
      this.removeClient(clientId);
    }
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`[Kafka Pool] Client ${clientId} removed. Remaining clients: ${this.clients.size}`);

    // Disconnect consumer if no clients remain
    if (this.clients.size === 0) {
      this.scheduleDisconnect();
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.consumer = this.kafka.consumer({
        groupId: KAFKA_CONFIG.CONSUMER_GROUP,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxWaitTimeInMs: 100, // Fast response for real-time
      });

      await this.consumer.connect();
      console.log('[Kafka Pool] Consumer connected');

      // Subscribe to all required topics
      await this.consumer.subscribe({ topic: KAFKA_CONFIG.TOPIC, fromBeginning: false });
      await this.consumer.subscribe({ topic: KAFKA_CONFIG.ALERT_TOPIC, fromBeginning: false });
      console.log('[Kafka Pool] Subscribed to topics');

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          this.broadcastMessage(topic, message.value);
        },
      });

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('[Kafka Pool] Consumer running');
    } catch (error) {
      console.error('[Kafka Pool] Connection failed:', error);
      this.isConnecting = false;
      this.isConnected = false;

      // Attempt reconnection with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`[Kafka Pool] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      } else {
        console.error('[Kafka Pool] Max reconnection attempts reached');
        this.notifyClientsError('Max reconnection attempts reached');
      }
    }
  }

  private broadcastMessage(topic: string, value: Buffer | null): void {
    if (!value) return;

    const deadClients: string[] = [];

    this.clients.forEach((client, clientId) => {
      // Check if client is interested in this topic
      if (!client.topics.has(topic)) return;

      try {
        // Different handling based on topic type
        if (topic === KAFKA_CONFIG.TOPIC) {
          // Telemetry data - encode as base64 so stream route can decode protobuf
          const base64Data = value.toString('base64');
          client.controller.enqueue(
            client.encoder.encode(`event: telemetry\ndata: ${base64Data}\n\n`)
          );
        } else if (topic === KAFKA_CONFIG.ALERT_TOPIC) {
          // Alert data - already JSON string
          client.controller.enqueue(
            client.encoder.encode(`event: alert\ndata: ${value.toString()}\n\n`)
          );
        }
      } catch (err) {
        console.error(`[Kafka Pool] Failed to send to client ${clientId}:`, err);
        deadClients.push(clientId);
      }
    });

    // Clean up dead clients
    deadClients.forEach(id => this.removeClient(id));
  }

  private notifyClientsError(error: string): void {
    const deadClients: string[] = [];

    this.clients.forEach((client, clientId) => {
      try {
        client.controller.enqueue(
          client.encoder.encode(`event: error\ndata: ${JSON.stringify({ error })}\n\n`)
        );
      } catch (err) {
        deadClients.push(clientId);
      }
    });

    deadClients.forEach(id => this.removeClient(id));
  }

  private disconnectTimer: NodeJS.Timeout | null = null;

  private scheduleDisconnect(): void {
    // Disconnect after 30 seconds of no clients
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
    }

    this.disconnectTimer = setTimeout(async () => {
      if (this.clients.size === 0 && this.consumer) {
        console.log('[Kafka Pool] No clients, disconnecting consumer');
        try {
          await this.consumer.disconnect();
          this.consumer = null;
          this.isConnected = false;
        } catch (err) {
          console.error('[Kafka Pool] Disconnect error:', err);
        }
      }
    }, 30000);
  }

  async shutdown(): Promise<void> {
    console.log('[Kafka Pool] Shutting down...');
    
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
    }

    this.clients.clear();

    if (this.consumer) {
      try {
        await this.consumer.disconnect();
        console.log('[Kafka Pool] Consumer disconnected');
      } catch (err) {
        console.error('[Kafka Pool] Shutdown error:', err);
      }
    }

    this.isConnected = false;
    this.consumer = null;
  }
}

export default KafkaConsumerPool;
