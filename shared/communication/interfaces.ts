/**
 * Interfaces para comunicação entre microserviços
 */

// Interface para requisições entre serviços
export interface ServiceRequest {
  service: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

// Interface para respostas entre serviços
export interface ServiceResponse<T = any> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

// Interface para mensagens assíncronas
export interface ServiceMessage {
  topic: string;
  payload: any;
  metadata: {
    timestamp: number;
    correlationId: string;
    source: string;
  };
}

// Interface para descoberta de serviços
export interface ServiceInfo {
  name: string;
  version: string;
  url: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  lastHeartbeat: number;
}

// Enum para tipos de eventos do sistema
export enum SystemEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  TENANT_CREATED = 'tenant.created',
  TENANT_UPDATED = 'tenant.updated',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_UPDATED = 'payment.updated',
}