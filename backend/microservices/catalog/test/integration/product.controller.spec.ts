import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProductController } from '../../src/controllers/product.controller';
import { ProductService } from '../../src/services/product.service';
import { AuthGuard } from '@nestjs/passport';
import { ProductStatus, ProductType } from '../../src/entities/product.entity';

// Mock do AuthGuard para testes de integração
const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation(() => true),
};

// Mock do ProductService
const mockProductService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  updateStock: jest.fn(),
  bulkImport: jest.fn(),
  getDashboardStats: jest.fn(),
};

// Mock do usuário autenticado para os testes
const mockUser = {
  id: 'user123',
  tenantId: 'tenant123',
  email: 'test@example.com',
};

describe('ProductController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
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

  describe('GET /products', () => {
    it('deve retornar todos os produtos', async () => {
      const mockProducts = [
        {
          id: 'product123',
          tenantId: 'tenant123',
          name: 'Test Product 1',
          status: ProductStatus.ACTIVE,
        },
        {
          id: 'product456',
          tenantId: 'tenant123',
          name: 'Test Product 2',
          status: ProductStatus.ACTIVE,
        },
      ];

      mockProductService.findAll.mockResolvedValue({ items: mockProducts, total: 2 });

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toEqual({ items: mockProducts, total: 2 });
      expect(mockProductService.findAll).toHaveBeenCalledWith('tenant123', {});
    });

    it('deve aplicar filtros na busca por produtos', async () => {
      const mockProducts = [
        {
          id: 'product123',
          tenantId: 'tenant123',
          name: 'Test Product',
          status: ProductStatus.ACTIVE,
          featured: true,
        },
      ];

      mockProductService.findAll.mockResolvedValue({ items: mockProducts, total: 1 });

      const response = await request(app.getHttpServer())
        .get('/products?status=active&featured=true&search=Test&skip=0&take=10&categoryId=category123')
        .expect(200);

      expect(response.body).toEqual({ items: mockProducts, total: 1 });
      expect(mockProductService.findAll).toHaveBeenCalledWith('tenant123', {
        status: 'active',
        featured: true,
        search: 'Test',
        skip: '0',
        take: '10',
        categoryId: 'category123',
      });
    });
  });

  describe('GET /products/:id', () => {
    it('deve retornar um produto pelo ID', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        status: ProductStatus.ACTIVE,
      };

      mockProductService.findById.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get('/products/product123')
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockProductService.findById).toHaveBeenCalledWith('product123', 'tenant123');
    });
  });

  describe('GET /products/slug/:slug', () => {
    it('deve retornar um produto pelo slug', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        slug: 'test-product',
        status: ProductStatus.ACTIVE,
      };

      mockProductService.findBySlug.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get('/products/slug/test-product')
        .expect(200);

      expect(response.body).toEqual(mockProduct);
      expect(mockProductService.findBySlug).toHaveBeenCalledWith('test-product', 'tenant123');
    });
  });

  describe('POST /products', () => {
    it('deve criar um novo produto', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 100,
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      const createdProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        ...productData,
        slug: 'new-product',
      };

      mockProductService.create.mockResolvedValue(createdProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body).toEqual(createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith('tenant123', productData);
    });

    it('deve validar os dados do produto', async () => {
      const invalidProductData = {
        // Faltando name e price, que são obrigatórios
        description: 'Product description',
        type: ProductType.PHYSICAL,
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(invalidProductData)
        .expect(400);

      expect(mockProductService.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /products/:id', () => {
    it('deve atualizar um produto existente', async () => {
      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 150,
      };

      const updatedProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        ...updateData,
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      mockProductService.update.mockResolvedValue(updatedProduct);

      const response = await request(app.getHttpServer())
        .put('/products/product123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith('product123', 'tenant123', updateData);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deve remover um produto', async () => {
      mockProductService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/products/product123')
        .expect(204);

      expect(mockProductService.remove).toHaveBeenCalledWith('product123', 'tenant123');
    });
  });

  describe('PUT /products/:id/stock', () => {
    it('deve atualizar o estoque de um produto', async () => {
      mockProductService.updateStock.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .put('/products/product123/stock')
        .send({ quantity: 10 })
        .expect(200);

      expect(response.body).toEqual({ message: 'Stock updated successfully' });
      expect(mockProductService.updateStock).toHaveBeenCalledWith('product123', 'tenant123', 10);
    });

    it('deve validar a quantidade do estoque', async () => {
      await request(app.getHttpServer())
        .put('/products/product123/stock')
        .send({ quantity: 'invalid' }) // Quantidade deve ser um número
        .expect(400);

      expect(mockProductService.updateStock).not.toHaveBeenCalled();
    });
  });

  describe('POST /products/bulk-import', () => {
    it('deve importar produtos em massa', async () => {
      const productsToImport = {
        products: [
          {
            name: 'Product 1',
            price: 100,
            type: ProductType.PHYSICAL,
            status: ProductStatus.ACTIVE,
          },
          {
            name: 'Product 2',
            price: 200,
            type: ProductType.DIGITAL,
            status: ProductStatus.ACTIVE,
          },
        ],
      };

      const importResult = {
        success: 2,
        failed: 0,
      };

      mockProductService.bulkImport.mockResolvedValue(importResult);

      const response = await request(app.getHttpServer())
        .post('/products/bulk-import')
        .send(productsToImport)
        .expect(201);

      expect(response.body).toEqual(importResult);
      expect(mockProductService.bulkImport).toHaveBeenCalledWith('tenant123', productsToImport.products);
    });

    it('deve validar os dados dos produtos para importação', async () => {
      const invalidProductsToImport = {
        products: [
          {
            // Faltando name e price, que são obrigatórios
            type: ProductType.PHYSICAL,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/products/bulk-import')
        .send(invalidProductsToImport)
        .expect(400);

      expect(mockProductService.bulkImport).not.toHaveBeenCalled();
    });
  });

  describe('GET /products/dashboard/stats', () => {
    it('deve retornar estatísticas para o dashboard', async () => {
      const mockStats = {
        totalProducts: 10,
        productsByType: [
          { type: ProductType.PHYSICAL, count: 5 },
          { type: ProductType.DIGITAL, count: 3 },
          { type: ProductType.SERVICE, count: 2 },
        ],
        lowStock: [
          {
            id: 'product1',
            name: 'Low Stock Product',
            sku: 'SKU001',
            stock: 2,
          },
        ],
      };

      mockProductService.getDashboardStats.mockResolvedValue(mockStats);

      const response = await request(app.getHttpServer())
        .get('/products/dashboard/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(mockProductService.getDashboardStats).toHaveBeenCalledWith('tenant123');
    });
  });
});
