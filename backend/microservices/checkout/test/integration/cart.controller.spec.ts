import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CartController } from '../../src/controllers/cart.controller';
import { CartService } from '../../src/services/cart.service';
import { AuthGuard } from '@nestjs/passport';

// Mock do AuthGuard para testes de integração
class MockAuthGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    request.user = { tenantId: 'tenant123', userId: 'user123' };
    return true;
  }
}

// Mock do CartService
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

// Mock do usuário autenticado para os testes
const mockUser = {
  id: 'user123',
  tenantId: 'tenant123',
  email: 'test@example.com',
};

describe('CartController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    // Mock para o request.user que seria normalmente definido pelo AuthGuard
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /carts', () => {
    it('deve criar um novo carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      mockCartService.findOrCreateCart.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .post('/carts')
        .send({ sessionId: 'session123' })
        .expect(201);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.findOrCreateCart).toHaveBeenCalledWith('tenant123', {
        sessionId: 'session123',
        userId: 'user123',
      });
    });
  });

  describe('GET /carts/:id', () => {
    it('deve retornar um carrinho pelo ID', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        sessionId: 'session123',
        items: [],
        subtotal: 0,
        total: 0,
      };

      mockCartService.findById.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .get('/carts/cart123')
        .expect(200);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('POST /carts/:id/items', () => {
    it('deve adicionar um item ao carrinho', async () => {
      const mockCart = {
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

      mockCartService.addItem.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .post('/carts/cart123/items')
        .send(itemData)
        .expect(201);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.addItem).toHaveBeenCalledWith('cart123', 'tenant123', itemData);
    });

    it('deve validar os dados do item', async () => {
      const invalidItemData = {
        // Faltando productId e name, que são obrigatórios
        price: 100,
      };

      await request(app.getHttpServer())
        .post('/carts/cart123/items')
        .send(invalidItemData)
        .expect(400);

      expect(mockCartService.addItem).not.toHaveBeenCalled();
    });
  });

  describe('PUT /carts/:id/items/:itemId', () => {
    it('deve atualizar a quantidade de um item', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
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

      mockCartService.updateItemQuantity.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .put('/carts/cart123/items/item123')
        .send({ quantity: 2 })
        .expect(200);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.updateItemQuantity).toHaveBeenCalledWith(
        'cart123',
        'item123',
        'tenant123',
        2
      );
    });

    it('deve validar a quantidade do item', async () => {
      await request(app.getHttpServer())
        .put('/carts/cart123/items/item123')
        .send({ quantity: 'invalid' }) // Quantidade deve ser um número
        .expect(400);

      expect(mockCartService.updateItemQuantity).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /carts/:id/items/:itemId', () => {
    it('deve remover um item do carrinho', async () => {
      mockCartService.removeItem.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/carts/cart123/items/item123')
        .expect(204);

      expect(mockCartService.removeItem).toHaveBeenCalledWith(
        'cart123',
        'item123',
        'tenant123'
      );
    });
  });

  describe('DELETE /carts/:id/items', () => {
    it('deve limpar todos os itens do carrinho', async () => {
      mockCartService.clearCart.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/carts/cart123/items')
        .expect(204);

      expect(mockCartService.clearCart).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('PUT /carts/:id/shipping-address', () => {
    it('deve definir o endereço de entrega', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
        items: [],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      };

      const shippingAddress = {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };

      mockCartService.setShippingAddress.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .put('/carts/cart123/shipping-address')
        .send(shippingAddress)
        .expect(200);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.setShippingAddress).toHaveBeenCalledWith(
        'cart123',
        'tenant123',
        shippingAddress
      );
    });

    it('deve validar o endereço de entrega', async () => {
      const invalidAddress = {
        // Faltando campos obrigatórios
        firstName: 'John',
      };

      await request(app.getHttpServer())
        .put('/carts/cart123/shipping-address')
        .send(invalidAddress)
        .expect(400);

      expect(mockCartService.setShippingAddress).not.toHaveBeenCalled();
    });
  });

  describe('POST /carts/:id/start-checkout', () => {
    it('deve iniciar o processo de checkout', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        userId: 'user123',
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
        isCheckoutStarted: true,
      };

      mockCartService.startCheckout.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .post('/carts/cart123/start-checkout')
        .expect(201);

      expect(response.body).toEqual(mockCart);
      expect(mockCartService.startCheckout).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });

  describe('DELETE /carts/:id', () => {
    it('deve excluir um carrinho', async () => {
      mockCartService.deleteCart.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/carts/cart123')
        .expect(204);

      expect(mockCartService.deleteCart).toHaveBeenCalledWith('cart123', 'tenant123');
    });
  });
});
