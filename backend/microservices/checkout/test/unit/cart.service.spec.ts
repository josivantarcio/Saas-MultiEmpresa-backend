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

      const result = await cartService.findOrCreateCart('tenant123', { 
        userId: 'user123', 
        sessionId: 'session123' 
      });
      
      expect(result).toEqual(mockCart);
      expect(cartRepository.findByUserId).toHaveBeenCalledWith('user123', 'tenant123');
      expect(cartRepository.findBySessionId).toHaveBeenCalledWith('session123', 'tenant123');
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
});
