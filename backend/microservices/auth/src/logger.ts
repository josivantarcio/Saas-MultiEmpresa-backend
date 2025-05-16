import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    // Para Loki via Promtail, use apenas o console, pois o Promtail coleta logs do stdout
  ],
});

export default logger;
