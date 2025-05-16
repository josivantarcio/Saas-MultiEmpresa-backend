// ... existing code ...

import { HttpClient } from '../../../../shared/src/communication/http-client';
import { EventBus } from '../../../../shared/src/events/event-bus';

export class CartService {
  private catalogClient: HttpClient;
  private eventBus: EventBus;
  
  constructor(
    private cartRepository: CartRepository,
    private cartItemRepository: CartItemRepository
  ) {
    // Inicializar cliente HTTP para comunicação com o serviço de catálogo
    this.catalogClient = new HttpClient(
      process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
      process.env.SERVICE_TOKEN || 'default-service-token'
    );
    
    // Inicializar barramento de eventos
    this.eventBus = EventBus.getInstance();
    this.initEventListeners();
  }
  
  private async initEventListeners() {
    await this.eventBus.connect();
    
    // Inscrever-se em eventos do serviço de catálogo
    this.eventBus.subscribeToEvent('catalog', 'product.updated', async (data) => {
      // Atualizar preços dos itens no carrinho quando um produto for atualizado
      await this.updateCartItemsForProduct(data.productId, data.price);
    });
    
    this.eventBus.subscribeToEvent('catalog', 'product.deleted', async (data) => {
      // Remover itens do carrinho quando um produto for excluído
      await this.removeCartItemsForProduct(data.productId);
    });
  }
  
  async addItemToCart(userId: string, tenantId: string, productId: string, quantity: number) {
    // Verificar se o produto existe e está disponível
    const product = await this.catalogClient.get(`/products/${productId}`);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    if (product.stock < quantity) {
      throw new Error('Quantidade solicitada não disponível em estoque');
    }
    
    // Buscar ou criar carrinho para o usuário
    let cart = await this.cartRepository.findByUserAndTenant(userId, tenantId);
    
    if (!cart) {
      cart = await this.cartRepository.create({
        userId,
        tenantId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Verificar se o item já existe no carrinho
    const existingItem = await this.cartItemRepository.findByCartAndProduct(cart.id, productId);
    
    if (existingItem) {
      // Atualizar quantidade do item existente
      await this.cartItemRepository.update(existingItem.id, {
        quantity: existingItem.quantity + quantity,
        updatedAt: new Date()
      });
    } else {
      // Adicionar novo item ao carrinho
      await this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        productName: product.name,
        price: product.price,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Publicar evento de item adicionado ao carrinho
    await this.eventBus.publishEvent('checkout', 'cart.item.added', {
      cartId: cart.id,
      productId,
      quantity,
      userId,
      tenantId
    });
    
    return this.getCart(userId, tenantId);
  }
  
  private async updateCartItemsForProduct(productId: string, newPrice: number) {
    // Atualizar preço de todos os itens no carrinho para o produto específico
    const cartItems = await this.cartItemRepository.findByProduct(productId);
    
    for (const item of cartItems) {
      await this.cartItemRepository.update(item.id, {
        price: newPrice,
        updatedAt: new Date()
      });
    }
  }
  
  private async removeCartItemsForProduct(productId: string) {
    // Remover todos os itens no carrinho para o produto específico
    const cartItems = await this.cartItemRepository.findByProduct(productId);
    
    for (const item of cartItems) {
      await this.cartItemRepository.delete(item.id);
    }
  }
  
  // ... existing code ...
}