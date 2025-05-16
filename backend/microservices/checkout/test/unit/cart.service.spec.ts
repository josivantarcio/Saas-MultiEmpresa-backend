import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../src/services/cart.service';
import { CartRepository } from '../../src/repositories/cart.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Cart } from '../../src/entities/cart.entity';
import { CartItem } from '../../src/entities/cart-item.entity';

// Mock do repositório
const mockCartRepository = () => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySessionId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  addItem: jest.fn(),
  updateItem: jest.fn(),
  removeItem: jest.fn(),
  clearItems: jest.fn(),
  calculateTotals: jest.fn(),
  findAbandoned: jest.fn(),
  markAsAbandoned: jest.fn(),
  updateLastNotification: jest.fn(),
  remove: jest.fn(),
});

describe('CartService', () => {
  let cartService: CartService;
  let cartRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useFactory: mockCartRepository,
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
  });

  describe('findById', () => {
    it('deve retornar um carrinho quando encontrado', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        isEmpty: true,
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      const result = await cartService.findById('cart123', 'tenant123');
      expect(result).toEqual(mockCart);
      expect(cartRepository.findById).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o carrinho não for encontrado', async () => {
      cartRepository.findById.mockResolvedValue(null);

      await expect(cartService.findById('cart123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOrCreateCart', () => {
    it('deve retornar um carrinho existente por userId', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
      };

      cartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.findOrCreateCart('tenant123', { userId: 'user123' });
      expect(result).toEqual(mockCart);
      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user123', 'tenant123');
    });

    it('deve retornar um carrinho existente por sessionId quando userId não encontra', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: null,
        sessionId: 'session123',
        items: [],
      };

      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue({
        ...mockCart,
        userId: 'user123',
      });

      const result = await cartService.findOrCreateCart('tenant123', { 
        userId: 'user123', 
        sessionId: 'session123' 
      });
      
      // Quando um carrinho é encontrado por sessionId e o userId é fornecido,
      // o serviço atualiza o carrinho com o userId
      expect(result).toEqual({
        ...mockCart,
        userId: 'user123',
      });
      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user123', 'tenant123');
      expect(cartRepository.findBySessionId).toHaveBeenCalledWith('session123', 'tenant123');
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { userId: 'user123' });
    });

    it('deve atualizar o userId de um carrinho existente quando encontrado por sessionId', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: null,
        sessionId: 'session123',
        items: [],
      };

      const updatedCart = {
        ...mockCart,
        userId: 'user123',
      };

      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.findBySessionId.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await cartService.findOrCreateCart('tenant123', { 
        userId: 'user123', 
        sessionId: 'session123' 
      });
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { userId: 'user123' });
    });

    it('deve criar um novo carrinho quando nenhum existente for encontrado', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
      };

      cartRepository.findByUserId.mockResolvedValue(null);
      cartRepository.findBySessionId.mockResolvedValue(null);
      cartRepository.create.mockResolvedValue(mockCart);

      const result = await cartService.findOrCreateCart('tenant123', { 
        userId: 'user123', 
        sessionId: 'session123' 
      });
      
      expect(result).toEqual(mockCart);
      expect(cartRepository.create).toHaveBeenCalledWith({
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
      });
    });
  });

  describe('addItem', () => {
    it('deve adicionar um item ao carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
      };

      const itemData = {
        productId: 'product123',
        name: 'Test Product',
        price: 100,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.addItem.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.addItem('cart123', 'tenant123', itemData);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.addItem).toHaveBeenCalledWith('cart123', {
        productId: 'product123',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        attributes: {},
        productVariantId: undefined,
        sku: undefined,
        imageUrl: undefined,
        requiresShipping: false,
        isDigital: false,
        isService: false,
        appointmentDate: undefined,
        appointmentDuration: undefined,
        appointmentStaffId: undefined,
      });
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('updateItemQuantity', () => {
    it('deve atualizar a quantidade de um item e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 2,
          },
        ],
        subtotal: 200,
        total: 200,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.updateItem.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.updateItemQuantity('cart123', 'item123', 'tenant123', 2);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.updateItem).toHaveBeenCalledWith('item123', 'cart123', { quantity: 2 });
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o item não for encontrado', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      await expect(
        cartService.updateItemQuantity('cart123', 'item123', 'tenant123', 2)
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando a quantidade for menor que 1', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      await expect(
        cartService.updateItemQuantity('cart123', 'item123', 'tenant123', 0)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItem', () => {
    it('deve remover um item do carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.removeItem.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.removeItem('cart123', 'item123', 'tenant123');
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.removeItem).toHaveBeenCalledWith('item123', 'cart123');
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o item não for encontrado', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      await expect(
        cartService.removeItem('cart123', 'item123', 'tenant123')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('startCheckout', () => {
    it('deve iniciar o checkout quando o carrinho não estiver vazio', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
        isEmpty: false,
      };

      const updatedCart = {
        ...mockCart,
        isCheckoutStarted: true,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await cartService.startCheckout('cart123', 'tenant123');
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { isCheckoutStarted: true });
    });

    it('deve lançar BadRequestException ao iniciar checkout com carrinho vazio', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        isEmpty: true,
      };

      cartRepository.findById.mockResolvedValue(mockCart);

      await expect(
        cartService.startCheckout('cart123', 'tenant123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAbandonedCarts', () => {
    it('deve retornar carrinhos abandonados', async () => {
      const mockCarts = [
        {
          id: 'cart123',
          tenantId: 'tenant123',
          items: [{ id: 'item123', productId: 'product123', name: 'Test Product', price: 100, quantity: 1 }],
          subtotal: 100,
          total: 100,
          isCheckoutStarted: true,
          lastActivity: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        },
      ];

      cartRepository.findAbandoned.mockResolvedValue(mockCarts);

      const result = await cartService.findAbandonedCarts('tenant123', 24);
      
      expect(result).toEqual(mockCarts);
      expect(cartRepository.findAbandoned).toHaveBeenCalledWith('tenant123', { hours: 24 });
    });
  });

  describe('addItem', () => {
    it('deve adicionar um item ao carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
      };

      const itemData = {
        productId: 'product123',
        name: 'Test Product',
        price: 100,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.addItem.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.addItem('cart123', 'tenant123', itemData);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.addItem).toHaveBeenCalledWith('cart123', expect.objectContaining({
        productId: 'product123',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      }));
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve adicionar um item com atributos personalizados', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            attributes: { color: 'red', size: 'M' },
            isDigital: true,
          },
        ],
        subtotal: 200,
        total: 200,
      };

      const itemData = {
        productId: 'product123',
        name: 'Test Product',
        price: 100,
        quantity: 2,
        attributes: { color: 'red', size: 'M' },
        isDigital: true,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.addItem.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.addItem('cart123', 'tenant123', itemData);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.addItem).toHaveBeenCalledWith('cart123', expect.objectContaining({
        productId: 'product123',
        name: 'Test Product',
        price: 100,
        quantity: 2,
        attributes: { color: 'red', size: 'M' },
        isDigital: true,
      }));
    });
  });

  describe('clearCart', () => {
    it('deve limpar todos os itens do carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        total: 100,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.clearItems.mockResolvedValue(undefined);
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.clearCart('cart123', 'tenant123');
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.clearItems).toHaveBeenCalledWith('cart123');
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('updateCart', () => {
    it('deve atualizar os dados do carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        metadata: {},
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        metadata: { source: 'mobile' },
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await cartService.updateCart('cart123', 'tenant123', { metadata: { source: 'mobile' } });
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { metadata: { source: 'mobile' } });
    });
  });

  describe('applyShipping', () => {
    it('deve aplicar método de envio ao carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        shippingAmount: 0,
        total: 100,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        shippingAmount: 15,
        shippingMethodId: 'shipping123',
        total: 115,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue({ ...mockCart, shippingMethodId: 'shipping123', shippingAmount: 15 });
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.applyShipping('cart123', 'tenant123', 'shipping123', 15);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', {
        shippingMethodId: 'shipping123',
        shippingAmount: 15,
      });
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('applyCoupon', () => {
    it('deve aplicar cupom ao carrinho e recalcular totais', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        discountAmount: 0,
        total: 100,
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
        discountAmount: 10,
        couponCode: 'DESCONTO10',
        total: 90,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue({ ...mockCart, couponCode: 'DESCONTO10', discountAmount: 10 });
      cartRepository.calculateTotals.mockResolvedValue(updatedCart);

      const result = await cartService.applyCoupon('cart123', 'tenant123', 'DESCONTO10', 10);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', {
        couponCode: 'DESCONTO10',
        discountAmount: 10,
      });
      expect(cartRepository.calculateTotals).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('setShippingAddress', () => {
    it('deve definir o endereço de entrega do carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const shippingAddress = {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        shippingAddress,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await cartService.setShippingAddress('cart123', 'tenant123', shippingAddress);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { shippingAddress });
    });
  });

  describe('setBillingAddress', () => {
    it('deve definir o endereço de cobrança do carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const billingAddress = {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
      };

      const updatedCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [],
        subtotal: 0,
        total: 0,
        billingAddress,
      };

      cartRepository.findById.mockResolvedValue(mockCart);
      cartRepository.update.mockResolvedValue(updatedCart);

      const result = await cartService.setBillingAddress('cart123', 'tenant123', billingAddress);
      
      expect(result).toEqual(updatedCart);
      expect(cartRepository.update).toHaveBeenCalledWith('cart123', 'tenant123', { billingAddress });
    });
  });

  describe('markCartAsAbandoned', () => {
    it('deve marcar o carrinho como abandonado', async () => {
      cartRepository.markAsAbandoned.mockResolvedValue(undefined);

      await cartService.markCartAsAbandoned('cart123', 'tenant123');
      
      expect(cartRepository.markAsAbandoned).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('updateLastNotification', () => {
    it('deve atualizar a data da última notificação do carrinho', async () => {
      cartRepository.updateLastNotification.mockResolvedValue(undefined);

      await cartService.updateLastNotification('cart123', 'tenant123');
      
      expect(cartRepository.updateLastNotification).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('deleteCart', () => {
    it('deve excluir o carrinho', async () => {
      cartRepository.remove.mockResolvedValue(undefined);

      await cartService.deleteCart('cart123', 'tenant123');
      
      expect(cartRepository.remove).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });
});
