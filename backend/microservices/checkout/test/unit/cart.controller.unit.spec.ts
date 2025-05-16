import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from '../../src/controllers/cart.controller';
import { CartService } from '../../src/services/cart.service';

describe('CartController (Unit)', () => {
  let cartController: CartController;
  let cartService: CartService;

  beforeEach(async () => {
    // Mock do CartService com todas as funções necessárias
    const mockCartService = {
      findOrCreateCart: jest.fn(),
      findById: jest.fn(),
      addItem: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      setShippingAddress: jest.fn(),
      setBillingAddress: jest.fn(),
      startCheckout: jest.fn(),
      deleteCart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  describe('createCart', () => {
    it('deve criar um novo carrinho', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const createCartDto = { sessionId: 'session123' };
      const req = { user: { tenantId: 'tenant123', id: 'user123' } };

      jest.spyOn(cartService, 'findOrCreateCart').mockResolvedValue(mockCart);

      const result = await cartController.createCart(req, createCartDto);
      
      expect(result).toEqual(mockCart);
      expect(cartService.findOrCreateCart).toHaveBeenCalledWith('tenant123', {
        sessionId: 'session123',
        userId: 'user123',
      });
    });
  });

  describe('findById', () => {
    it('deve retornar um carrinho pelo ID', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'findById').mockResolvedValue(mockCart);

      const result = await cartController.findById(req, 'cart123');
      
      expect(result).toEqual(mockCart);
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('addItem', () => {
    it('deve adicionar um item ao carrinho', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
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

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'addItem').mockResolvedValue(mockCart);

      const result = await cartController.addItem(req, 'cart123', itemData);
      
      expect(result).toEqual(mockCart);
      expect(cartService.addItem).toHaveBeenCalledWith('cart123', 'tenant123', itemData);
    });
  });

  describe('updateItemQuantity', () => {
    it('deve atualizar a quantidade de um item', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
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

      const updateDto = { quantity: 2 };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'updateItemQuantity').mockResolvedValue(mockCart);

      const result = await cartController.updateItemQuantity(req, 'cart123', 'item123', updateDto);
      
      expect(result).toEqual(mockCart);
      expect(cartService.updateItemQuantity).toHaveBeenCalledWith(
        'cart123',
        'item123',
        'tenant123',
        2
      );
    });
  });

  describe('removeItem', () => {
    it('deve remover um item do carrinho', async () => {
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'removeItem').mockResolvedValue(undefined);

      await cartController.removeItem(req, 'cart123', 'item123');
      
      expect(cartService.removeItem).toHaveBeenCalledWith('cart123', 'item123', 'tenant123');
    });
  });

  describe('clearCart', () => {
    it('deve limpar todos os itens do carrinho', async () => {
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'clearCart').mockResolvedValue(undefined);

      await cartController.clearCart(req, 'cart123');
      
      expect(cartService.clearCart).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('setShippingAddress', () => {
    it('deve definir o endereço de entrega', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
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

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'setShippingAddress').mockResolvedValue(mockCart);

      const result = await cartController.setShippingAddress(req, 'cart123', shippingAddress);
      
      expect(result).toEqual(mockCart);
      expect(cartService.setShippingAddress).toHaveBeenCalledWith('cart123', 'tenant123', shippingAddress);
    });
  });

  describe('setBillingAddress', () => {
    it('deve definir o endereço de cobrança', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
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

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'setBillingAddress').mockResolvedValue(mockCart);

      const result = await cartController.setBillingAddress(req, 'cart123', billingAddress);
      
      expect(result).toEqual(mockCart);
      expect(cartService.setBillingAddress).toHaveBeenCalledWith('cart123', 'tenant123', billingAddress);
    });
  });

  describe('startCheckout', () => {
    it('deve iniciar o processo de checkout', async () => {
      const mockCart: any = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
        status: 'checkout_started',
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'startCheckout').mockResolvedValue(mockCart);

      const result = await cartController.startCheckout(req, 'cart123');
      
      expect(result).toEqual(mockCart);
      expect(cartService.startCheckout).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('deleteCart', () => {
    it('deve excluir um carrinho', async () => {
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(cartService, 'deleteCart').mockResolvedValue(undefined);

      await cartController.deleteCart(req, 'cart123');
      
      expect(cartService.deleteCart).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });
});
