import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Serviço para limitar tentativas de login e prevenir ataques de força bruta
 */
@Injectable()
export class RateLimiterService {
  private loginAttempts: Map<string, { count: number, lastAttempt: Date }> = new Map();
  
  constructor(
    private readonly configService: ConfigService,
  ) {}
  
  /**
   * Registra uma tentativa de login
   * @param identifier Identificador único (email, username ou IP)
   * @returns true se o usuário pode tentar login, false se está bloqueado
   */
  registerLoginAttempt(identifier: string): boolean {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
    const lockoutTime = this.parseDuration(this.configService.get<string>('LOCKOUT_TIME') || '15m');
    
    const now = new Date();
    const userAttempts = this.loginAttempts.get(identifier);
    
    // Se não há tentativas anteriores, registra a primeira
    if (!userAttempts) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Verifica se o período de bloqueio já passou
    const timeSinceLastAttempt = now.getTime() - userAttempts.lastAttempt.getTime();
    if (userAttempts.count >= maxAttempts && timeSinceLastAttempt < lockoutTime) {
      // Usuário está bloqueado
      return false;
    }
    
    // Se o período de bloqueio passou, reinicia a contagem
    if (timeSinceLastAttempt >= lockoutTime) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Incrementa a contagem de tentativas
    this.loginAttempts.set(identifier, { 
      count: userAttempts.count + 1, 
      lastAttempt: now 
    });
    
    // Verifica se o usuário atingiu o limite de tentativas
    return userAttempts.count + 1 < maxAttempts;
  }
  
  /**
   * Reseta as tentativas de login após um login bem-sucedido
   * @param identifier Identificador único (email, username ou IP)
   */
  resetLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }
  
  /**
   * Retorna o tempo restante de bloqueio em milissegundos
   * @param identifier Identificador único (email, username ou IP)
   * @returns Tempo restante em milissegundos ou 0 se não estiver bloqueado
   */
  getRemainingLockoutTime(identifier: string): number {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
    const lockoutTime = this.parseDuration(this.configService.get<string>('LOCKOUT_TIME') || '15m');
    
    const userAttempts = this.loginAttempts.get(identifier);
    if (!userAttempts || userAttempts.count < maxAttempts) {
      return 0;
    }
    
    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - userAttempts.lastAttempt.getTime();
    
    if (timeSinceLastAttempt >= lockoutTime) {
      return 0;
    }
    
    return lockoutTime - timeSinceLastAttempt;
  }
  
  /**
   * Converte uma string de duração (ex: "15m", "1h") para milissegundos
   * @param duration String de duração
   * @returns Duração em milissegundos
   */
  private parseDuration(duration: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = duration.match(regex);
    
    if (!match) {
      return 15 * 60 * 1000; // Padrão: 15 minutos
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000; // segundos
      case 'm': return value * 60 * 1000; // minutos
      case 'h': return value * 60 * 60 * 1000; // horas
      case 'd': return value * 24 * 60 * 60 * 1000; // dias
      default: return 15 * 60 * 1000; // Padrão: 15 minutos
    }
  }
}
