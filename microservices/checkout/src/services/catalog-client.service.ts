import { Injectable } from '@nestjs/common';
import { ServiceClient } from '../../../shared/http-client/service-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CatalogClientService {
  private client: ServiceClient;

  constructor(private configService: ConfigService) {
    const catalogServiceUrl = this.configService.get<string>('CATALOG_SERVICE_URL') || 'http://localhost:3002';
    this.client = new ServiceClient(catalogServiceUrl, 'catalog-service');
  }

  async getProduct(productId: string) {
    return this.client.get<any>(`/products/${productId}`);
  }

  async checkProductAvailability(productId: string, quantity: number) {
    return this.client.post<{ available: boolean, currentStock: number }>('/products/check-availability', {
      productId,
      quantity
    });
  }

  async updateProductStock(productId: string, quantity: number) {
    return this.client.put<any>(`/products/${productId}/stock`, {
      quantity
    });
  }
}