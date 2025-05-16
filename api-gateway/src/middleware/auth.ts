import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Token de autenticação não fornecido'
      });
    }
    
    // Verificar token com o serviço de autenticação
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.post(`${authServiceUrl}/verify-token`, { token });
    
    if (response.data.valid) {
      // Adicionar informações do usuário ao objeto de requisição
      req.user = response.data.user;
      req.tenant = response.data.tenant;
      next();
    } else {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido ou expirado'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar autenticação'
    });
  }
};