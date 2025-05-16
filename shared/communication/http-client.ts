/**
 * Cliente HTTP para comunicação síncrona entre microserviços
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServiceRequest, ServiceResponse } from './interfaces';
import { CircuitBreaker } from './circuit-breaker';
import { ServiceDiscovery } from './service-discovery';

export class HttpServiceClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private serviceDiscovery: ServiceDiscovery;

  constructor(
    baseURL: string,
    private readonly serviceName: string,
    private readonly authToken?: string
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 10000,
    });

    this.serviceDiscovery = new ServiceDiscovery();
  }

  async request<T = any>(request: ServiceRequest): Promise<ServiceResponse<T>> {
    try {
      // Obter URL do serviço via service discovery
      const serviceUrl = await this.serviceDiscovery.getServiceUrl(request.service);
      
      // Configurar requisição
      const config: AxiosRequestConfig = {
        method: request.method,
        url: `${serviceUrl}${request.endpoint}`,
        data: request.data,
        params: request.params,
        headers: {
          ...this.axiosInstance.defaults.headers,
          ...request.headers,
          'X-Service-Name': this.serviceName,
        },
      };

      // Executar requisição com circuit breaker
      const response = await this.circuitBreaker.execute<AxiosResponse<T>>(() => 
        this.axiosInstance.request<T>(config)
      );

      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      console.error(`[HttpServiceClient] Error calling ${request.service}${request.endpoint}:`, error);
      throw error;
    }
  }

  // Métodos auxiliares para facilitar o uso
  async get<T = any>(service: string, endpoint: string, params?: Record<string, string>): Promise<T> {
    const response = await this.request<T>({
      service,
      endpoint,
      method: 'GET',
      params,
    });
    return response.data;
  }

  async post<T = any>(service: string, endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>({
      service,
      endpoint,
      method: 'POST',
      data,
    });
    return response.data;
  }

  async put<T = any>(service: string, endpoint: string, data?: any): Promise<T> {
    const response = await this.request<T>({
      service,
      endpoint,
      method: 'PUT',
      data,
    });
    return response.data;
  }

  async delete<T = any>(service: string, endpoint: string): Promise<T> {
    const response = await this.request<T>({
      service,
      endpoint,
      method: 'DELETE',
    });
    return response.data;
  }
}