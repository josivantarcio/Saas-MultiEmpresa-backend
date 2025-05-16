import winston from 'winston';

// Configuração para formatar logs em JSON
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Criar instância do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'saas-multi-empresa' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Adicionar transporte de arquivo para ambientes de produção
    ...(process.env.NODE_ENV === 'production' 
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
         new winston.transports.File({ filename: 'logs/combined.log' })]
      : [])
  ]
});

// Função auxiliar para adicionar contexto ao logger
export function createContextLogger(context: Record<string, any>) {
  return {
    info: (message: string | Record<string, any>) => {
      if (typeof message === 'string') {
        logger.info({ message, ...context });
      } else {
        logger.info({ ...message, ...context });
      }
    },
    error: (message: string | Record<string, any>, error?: Error) => {
      if (typeof message === 'string') {
        logger.error({ message, error, ...context });
      } else {
        logger.error({ ...message, ...(error ? { error } : {}), ...context });
      }
    },
    warn: (message: string | Record<string, any>) => {
      if (typeof message === 'string') {
        logger.warn({ message, ...context });
      } else {
        logger.warn({ ...message, ...context });
      }
    },
    debug: (message: string | Record<string, any>) => {
      if (typeof message === 'string') {
        logger.debug({ message, ...context });
      } else {
        logger.debug({ ...message, ...context });
      }
    }
  };
}

export { logger };