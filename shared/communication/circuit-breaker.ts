import { logger } from '../utils/logger';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitorInterval?: number;
  onStateChange?: (state: CircuitState) => void;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly options: CircuitBreakerOptions;
  private readonly successThreshold: number = 2;
  private timer: NodeJS.Timeout | null = null;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      monitorInterval: 5000,
      ...options
    };
    
    // Iniciar monitoramento periódico
    this.startMonitoring();
  }

  private startMonitoring() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => this.monitor(), this.options.monitorInterval);
  }
  
  private monitor() {
    // Verificar se o circuito deve tentar fechar após período de timeout
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if ((now - this.lastFailureTime) > this.options.resetTimeout) {
        this.transitionToState(CircuitState.HALF_OPEN);
      }
    }
  }

  private transitionToState(newState: CircuitState) {
    if (this.state === newState) return;
    
    logger.info({
      message: `Circuit Breaker alterando estado: ${this.state} -> ${newState}`,
      oldState: this.state,
      newState
    });
    
    this.state = newState;
    
    if (this.options.onStateChange) {
      this.options.onStateChange(newState);
    }
    
    // Resetar contadores ao mudar de estado
    if (newState === CircuitState.CLOSED || newState === CircuitState.OPEN) {
      this.failureCount = 0;
      this.successCount = 0;
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error('Circuit Breaker está aberto. Recusando execução.');
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.transitionToState(CircuitState.CLOSED);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Resetar contador de falhas após sucesso
      this.failureCount = 0;
    }
  }

  private recordFailure() {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    
    if (this.state === CircuitState.HALF_OPEN || 
        (this.state === CircuitState.CLOSED && this.failureCount >= this.options.failureThreshold)) {
      this.transitionToState(CircuitState.OPEN);
    }
  }
  
  getState(): CircuitState {
    return this.state;
  }
  
  reset() {
    this.transitionToState(CircuitState.CLOSED);
  }
  
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}