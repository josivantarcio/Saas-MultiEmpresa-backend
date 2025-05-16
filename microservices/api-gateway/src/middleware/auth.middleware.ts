import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }
    
    // Verificar token com o serviço de autenticação
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.post(`${authServiceUrl}/verify-token`, { token });
    
    if (response.data.valid) {
      // Adicionar informações do usuário ao request para uso nos microserviços
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    logger.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro ao verificar autenticação' });
  }
};