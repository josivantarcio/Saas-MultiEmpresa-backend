import amqp from 'amqplib';
import { logger } from '../utils/logger';

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private isConnecting = false;
  private connectionRetryCount = 0;
  private readonly maxRetries = 10;
  private readonly retryInterval = 5000;
  
  async connect() {
    if (this.isConnecting) {
      logger.info('Conexão RabbitMQ já em andamento, ignorando solicitação duplicada');
      return this.channel;
    }

    this.isConnecting = true;
    
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Resetar contador de tentativas após conexão bem-sucedida
      this.connectionRetryCount = 0;
      
      logger.info('Conectado ao RabbitMQ com sucesso');
      
      // Configurar tratamento de erros e reconexão
      this.connection.on('error', (err) => {
        logger.error('Erro na conexão RabbitMQ:', err);
        this.reconnect();
      });
      
      this.connection.on('close', () => {
        logger.info('Conexão RabbitMQ fechada, tentando reconectar...');
        this.reconnect();
      });
      
      return this.channel;
    } catch (error) {
      logger.error('Falha ao conectar ao RabbitMQ:', error);
      this.reconnect();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }
  
  private async reconnect() {
    if (this.connectionRetryCount >= this.maxRetries) {
      logger.error(`Número máximo de tentativas de reconexão (${this.maxRetries}) atingido`);
      return;
    }
    
    this.connectionRetryCount++;
    
    setTimeout(async () => {
      try {
        logger.info(`Tentativa de reconexão ${this.connectionRetryCount}/${this.maxRetries}`);
        await this.connect();
      } catch (error) {
        logger.error('Falha na reconexão ao RabbitMQ:', error);
      }
    }, this.retryInterval);
  }
  
  async publishMessage(exchange: string, routingKey: string, message: any) {
    try {
      if (!this.channel) {
        logger.info('Canal não inicializado. Conectando...');
        await this.connect();
      }
      
      if (!this.channel) {
        throw new Error('Não foi possível estabelecer conexão com RabbitMQ');
      }
      
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      const messageWithTimestamp = {
        ...message,
        _metadata: {
          timestamp: Date.now(),
          source: process.env.SERVICE_NAME || 'unknown'
        }
      };
      
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(messageWithTimestamp)),
        { 
          persistent: true,
          contentType: 'application/json'
        }
      );
      
      logger.info({
        message: 'Mensagem publicada',
        exchange,
        routingKey
      });
    } catch (error) {
      logger.error({
        message: 'Erro ao publicar mensagem',
        exchange,
        routingKey,
        error
      });
      throw error;
    }
  }
  
  async consumeMessages(exchange: string, queue: string, routingKey: string, callback: (message: any) => Promise<void>) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      
      await this.channel!.assertExchange(exchange, 'topic', { durable: true });
      const q = await this.channel!.assertQueue(queue, { durable: true });
      
      await this.channel!.bindQueue(q.queue, exchange, routingKey);
      
      this.channel!.consume(q.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            this.channel!.ack(msg);
          } catch (error) {
            logger.error('Erro ao processar mensagem:', error);
            // Rejeitar a mensagem e colocá-la de volta na fila
            this.channel!.nack(msg, false, true);
          }
        }
      });
      
      logger.info(`Consumidor registrado para: ${routingKey}`);
    } catch (error) {
      logger.error('Erro ao configurar consumidor:', error);
      throw error;
    }
  }
  
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('Conexão RabbitMQ fechada');
    } catch (error) {
      logger.error('Erro ao fechar conexão RabbitMQ:', error);
    }
  }
}

export const rabbitMQService = new RabbitMQService();