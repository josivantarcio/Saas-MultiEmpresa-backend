/**
 * Message Broker para comunicação assíncrona entre microserviços
 * Implementação baseada em RabbitMQ
 */
import amqp, { Channel, Connection } from 'amqplib';
import { ServiceMessage, SystemEventType } from './interfaces';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface MessageBrokerConfig {
  url: string;
  exchange: string;
  serviceName: string;
}

export type MessageHandler = (message: ServiceMessage) => Promise<void>;

export class MessageBroker {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly handlers: Map<string, MessageHandler[]> = new Map();
  private readonly config: MessageBrokerConfig;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectInterval = 5000;
  private isConnecting = false;

  constructor(config: MessageBrokerConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      logger.info('[MessageBroker] Conexão já em andamento, ignorando solicitação duplicada');
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      
      // Configurar exchange
      await this.channel.assertExchange(this.config.exchange, 'topic', { durable: true });
      
      // Configurar handlers para reconexão
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));
      
      // Resetar contador de tentativas de reconexão
      this.reconnectAttempts = 0;
      
      logger.info({
        message: 'Conectado ao RabbitMQ com sucesso',
        service: this.config.serviceName,
        url: this.config.url
      });
    } catch (error) {
      logger.error({
        message: 'Erro ao conectar ao RabbitMQ',
        service: this.config.serviceName,
        error
      });
      await this.reconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async handleConnectionError(error: any): Promise<void> {
    logger.error({
      message: 'Erro na conexão RabbitMQ',
      service: this.config.serviceName,
      error
    });
    await this.reconnect();
  }

  private async handleConnectionClose(error: any): Promise<void> {
    logger.error({
      message: 'Conexão RabbitMQ fechada',
      service: this.config.serviceName,
      error
    });
    await this.reconnect();
  }

  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error({
        message: `Número máximo de tentativas de reconexão (${this.maxReconnectAttempts}) atingido`,
        service: this.config.serviceName
      });
      return;
    }

    this.reconnectAttempts++;
    logger.info({
      message: `Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      service: this.config.serviceName
    });
    
    setTimeout(async () => {
      try {
        await this.connect();
        // Reinscrever em todos os tópicos
        for (const topic of this.handlers.keys()) {
          await this.subscribe(topic);
        }
      } catch (error) {
        logger.error({
          message: 'Falha na reconexão',
          service: this.config.serviceName,
          error
        });
      }
    }, this.reconnectInterval);
  }

  async publish(topic: string, payload: any): Promise<void> {
    if (!this.channel) {
      logger.warn({
        message: 'Tentativa de publicação sem conexão ativa. Tentando conectar...',
        service: this.config.serviceName,
        topic
      });
      await this.connect();
    }

    if (!this.channel) {
      throw new Error('Não foi possível conectar ao RabbitMQ');
    }

    const message: ServiceMessage = {
      topic,
      payload,
      metadata: {
        timestamp: Date.now(),
        correlationId: uuidv4(),
        source: this.config.serviceName,
      },
    };

    try {
      this.channel.publish(
        this.config.exchange,
        topic,
        Buffer.from(JSON.stringify(message)),
        { 
          persistent: true,
          contentType: 'application/json'
        }
      );
      logger.info({
        message: 'Mensagem publicada com sucesso',
        service: this.config.serviceName,
        topic
      });
    } catch (error) {
      logger.error({
        message: 'Erro ao publicar mensagem',
        service: this.config.serviceName,
        topic,
        error
      });
      throw error;
    }
  }

  async subscribe(topic: string): Promise<void> {
    if (!this.channel) {
      throw new Error('[MessageBroker] Not connected to RabbitMQ');
    }

    try {
      // Criar fila específica para o serviço
      const queueName = `${this.config.serviceName}.${topic}`;
      await this.channel.assertQueue(queueName, { durable: true });
      
      // Vincular a fila ao exchange com o tópico especificado
      await this.channel.bindQueue(queueName, this.config.exchange, topic);
      
      // Consumir mensagens da fila
      await this.channel.consume(queueName, async (msg) => {
        if (!msg) return;
        
        try {
          const messageContent = msg.content.toString();
          const message: ServiceMessage = JSON.parse(messageContent);
          
          // Processar mensagem com os handlers registrados
          const handlers = this.handlers.get(topic) || [];
          await Promise.all(handlers.map(handler => handler(message)));
          
          // Confirmar processamento da mensagem
          this.channel?.ack(msg);
        } catch (error) {
          console.error(`[MessageBroker] Error processing message from topic ${topic}:`, error);
          // Rejeitar mensagem em caso de erro
          this.channel?.nack(msg, false, false);
        }
      });
      
      console.log(`[MessageBroker] Subscribed to topic ${topic}`);
    } catch (error) {
      console.error(`[MessageBroker] Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  onMessage(topic: string, handler: MessageHandler): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    
    this.handlers.get(topic)?.push(handler);
    
    // Se já estiver conectado, inscrever-se no tópico
    if (this.channel) {
      this.subscribe(topic).catch(error => {
        console.error(`[MessageBroker] Error subscribing to topic ${topic}:`, error);
      });
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      
      if (this.connection) {
        await this.connection.close();
      }
      
      logger.info({
        message: 'Desconectado do RabbitMQ',
        service: this.config.serviceName
      });
    } catch (error) {
      logger.error({
        message: 'Erro ao desconectar do RabbitMQ',
        service: this.config.serviceName,
        error
      });
      throw error;
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }
}