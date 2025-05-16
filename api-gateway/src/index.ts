import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import { verifyToken } from './middleware/auth';
import { logRequest } from './middleware/logging';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e utilidades
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logRequest);

// Rotas públicas (não requerem autenticação)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/'
  }
}));

// Middleware de autenticação para rotas protegidas
app.use('/api', verifyToken);

// Rotas protegidas (requerem autenticação)
app.use('/api/catalog', createProxyMiddleware({
  target: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/catalog': '/'
  }
}));

app.use('/api/checkout', createProxyMiddleware({
  target: process.env.CHECKOUT_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/checkout': '/'
  }
}));

app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/'
  }
}));

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro interno no servidor'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway rodando na porta ${PORT}`);
});