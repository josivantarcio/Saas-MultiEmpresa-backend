import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Gera um novo par de tokens (access token e refresh token)
   * @param payload Dados do usuário para incluir no token
   * @returns Objeto contendo access token e refresh token
   */
  async generateTokenPair(payload: TokenPayload) {
    const tokenId = uuidv4();
    
    // Access token com expiração curta (1 hora)
    const accessToken = this.jwtService.sign(
      {
        ...payload,
        tokenId,
        type: 'access',
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h', // Expiração curta para access token
      },
    );
    
    // Refresh token com expiração mais longa (7 dias)
    const refreshToken = this.jwtService.sign(
      {
        userId: payload.userId,
        tokenId,
        type: 'refresh',
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d', // Expiração mais longa para refresh token
      },
    );
    
    // Armazenar o refresh token no banco de dados (implementação a ser adicionada)
    // await this.storeRefreshToken(payload.userId, tokenId, refreshToken, '7d');
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hora em segundos
    };
  }
  
  /**
   * Verifica e decodifica um token JWT
   * @param token Token JWT a ser verificado
   * @returns Payload decodificado ou null se o token for inválido
   */
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      return payload;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Verifica e decodifica um refresh token
   * @param token Refresh token a ser verificado
   * @returns Payload decodificado ou null se o token for inválido
   */
  async verifyRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });
      
      if (payload.type !== 'refresh') {
        return null;
      }
      
      // Verificar se o refresh token existe no banco de dados e não foi revogado
      // const isValid = await this.validateStoredRefreshToken(payload.userId, payload.tokenId);
      // if (!isValid) return null;
      
      return payload;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Gera um novo access token a partir de um refresh token válido
   * @param refreshToken Refresh token válido
   * @returns Novo access token ou null se o refresh token for inválido
   */
  async refreshAccessToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return null;
    }
    
    // Buscar informações do usuário para incluir no novo token
    // const user = await this.userService.findById(payload.userId);
    // if (!user) return null;
    
    // Gerar novo access token
    const accessToken = this.jwtService.sign(
      {
        userId: payload.userId,
        // email: user.email,
        // role: user.role,
        // tenantId: user.tenantId,
        tokenId: payload.tokenId,
        type: 'access',
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );
    
    return {
      accessToken,
      expiresIn: 3600, // 1 hora em segundos
    };
  }
  
  /**
   * Revoga todos os tokens de um usuário
   * @param userId ID do usuário
   */
  async revokeAllUserTokens(userId: string) {
    // Implementação para revogar todos os tokens do usuário no banco de dados
    // await this.refreshTokenRepository.deleteMany({ userId });
  }
}
