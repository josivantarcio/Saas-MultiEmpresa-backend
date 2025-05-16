import amqp from 'amqplib';

export class EventBus {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private static instance: EventBus;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async connect(url: string = process.env.RABBITMQ_URL || 'amqp://localhost') {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log('Conectado ao RabbitMQ com sucesso');
    } catch (error) {
      console.error('Erro ao conectar ao RabbitMQ:', error);
      throw error;
    }
  }

  async publishEvent(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error('Canal não inicializado. Conecte-se primeiro.');
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        timestamp: Date.now(),
        contentType: 'application/json'
      });
      
      console.log(`Evento publicado: ${exchange}.${routingKey}`);
    } catch (error) {
      console.error('Erro ao publicar evento:', error);
      throw error;
    }
  }

  async subscribeToEvent(exchange: string, routingKey: string, callback: (message: any) => void) {
    if (!this.channel) {
      throw new Error('Canal não inicializado. Conecte-se primeiro.');
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      const { queue } = await this.channel.assertQueue('', { exclusive: true });
      await this.channel.bindQueue(queue, exchange, routingKey);
      
      this.channel.consume(queue, (msg) => {
        if (msg) {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel?.ack(msg);
        }
      });
      
      console.log(`Inscrito no evento: ${exchange}.${routingKey}`);
    } catch (error) {
      console.error('Erro ao se inscrever no evento:', error);
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
      console.log('Conexão com RabbitMQ fechada');
    } catch (error) {
      console.error('Erro ao fechar conexão com RabbitMQ:', error);
    }
  }
}