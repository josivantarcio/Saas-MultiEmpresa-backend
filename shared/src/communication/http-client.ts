import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class HttpClient {
  private client: AxiosInstance;
  private serviceToken: string;

  constructor(baseURL: string, serviceToken: string) {
    this.serviceToken = serviceToken;
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': this.serviceToken
      }
    });
    
    // Interceptor para adicionar token de serviço
    this.client.interceptors.request.use((config: AxiosRequestConfig) => {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['X-Service-Token'] = this.serviceToken;
      return config;
    });
  }

  async get(url: string, params?: any) {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(url: string, data: any) {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(url: string, data: any) {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(url: string) {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error('Erro na comunicação entre serviços:', error.message);
    
    if (error.response) {
      console.error('Resposta de erro:', error.response.data);
      throw new Error(`Erro na comunicação: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error(`Sem resposta do serviço: ${error.message}`);
    } else {
      throw new Error(`Erro na configuração da requisição: ${error.message}`);
    }
  }
}