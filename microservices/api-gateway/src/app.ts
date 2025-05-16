import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rotas para os microserviços
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  logLevel: 'debug'
}));

app.use('/api/catalog', authMiddleware, createProxyMiddleware({
  target: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/catalog': '' },
  logLevel: 'debug'
}));

app.use('/api/checkout', authMiddleware, createProxyMiddleware({
  target: process.env.CHECKOUT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/checkout': '' },
  logLevel: 'debug'
}));

app.use('/api/payments', authMiddleware, createProxyMiddleware({
  target: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' },
  logLevel: 'debug'
}));

// Middleware de tratamento de erros
app.use(errorHandler);

export default app;