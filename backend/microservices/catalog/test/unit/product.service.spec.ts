import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../src/services/product.service';
import { ProductRepository } from '../../src/repositories/product.repository';
import { CategoryRepository } from '../../src/repositories/category.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Product, ProductStatus, ProductType } from '../../src/entities/product.entity';

// Mock dos repositórios
const mockProductRepository = () => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  updateStock: jest.fn(),
  bulkCreate: jest.fn(),
  countByTenant: jest.fn(),
});

const mockCategoryRepository = () => ({
  findById: jest.fn(),
});

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository;
  let categoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useFactory: mockProductRepository,
        },
        {
          provide: CategoryRepository,
          useFactory: mockCategoryRepository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(ProductRepository);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  describe('findById', () => {
    it('deve retornar um produto quando encontrado', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        status: ProductStatus.ACTIVE,
      };

      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.findById('product123', 'tenant123');
      expect(result).toEqual(mockProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('product123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o produto não for encontrado', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.findById('product123', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('deve retornar um produto pelo slug', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        slug: 'test-product',
        status: ProductStatus.ACTIVE,
      };

      productRepository.findBySlug.mockResolvedValue(mockProduct);

      const result = await productService.findBySlug('test-product', 'tenant123');
      expect(result).toEqual(mockProduct);
      expect(productRepository.findBySlug).toHaveBeenCalledWith('test-product', 'tenant123');
    });

    it('deve lançar NotFoundException quando o slug não for encontrado', async () => {
      productRepository.findBySlug.mockResolvedValue(null);

      await expect(productService.findBySlug('test-product', 'tenant123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
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

      productRepository.findAll.mockResolvedValue([mockProducts, 2]);

      const result = await productService.findAll('tenant123');
      expect(result).toEqual({ items: mockProducts, total: 2 });
      expect(productRepository.findAll).toHaveBeenCalledWith('tenant123', {});
    });

    it('deve aplicar filtros na busca por produtos', async () => {
      const mockProducts = [
        {
          id: 'product123',
          tenantId: 'tenant123',
          name: 'Test Product',
          status: ProductStatus.ACTIVE,
          type: ProductType.PHYSICAL,
        },
      ];

      const options = {
        status: ProductStatus.ACTIVE,
        type: ProductType.PHYSICAL,
        search: 'Test',
      };

      productRepository.findAll.mockResolvedValue([mockProducts, 1]);

      const result = await productService.findAll('tenant123', options);
      expect(result).toEqual({ items: mockProducts, total: 1 });
      expect(productRepository.findAll).toHaveBeenCalledWith('tenant123', options);
    });
  });

  describe('create', () => {
    it('deve criar um novo produto', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 100,
        categoryId: 'category123',
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      const mockCategory = {
        id: 'category123',
        tenantId: 'tenant123',
        name: 'Test Category',
      };

      const createdProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        ...productData,
        slug: 'new-product',
      };

      categoryRepository.findById.mockResolvedValue(mockCategory);
      productRepository.findBySlug.mockResolvedValue(null);
      productRepository.create.mockResolvedValue(createdProduct);

      const result = await productService.create('tenant123', productData);
      
      expect(result).toEqual(createdProduct);
      expect(categoryRepository.findById).toHaveBeenCalledWith('category123', 'tenant123');
      expect(productRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant123',
        name: 'New Product',
        description: 'Product description',
        price: 100,
        categoryId: 'category123',
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
        slug: expect.any(String),
      }));
    });

    it('deve lançar BadRequestException quando a categoria não existir', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 100,
        categoryId: 'category123',
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        productService.create('tenant123', productData)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve gerar um slug único quando já existir um produto com o mesmo slug', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        price: 100,
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      const existingProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'New Product',
        slug: 'new-product',
      };

      const createdProduct = {
        id: 'product456',
        tenantId: 'tenant123',
        ...productData,
        slug: 'new-product-123456',
      };

      productRepository.findBySlug.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce(null);
      productRepository.create.mockResolvedValue(createdProduct);

      const result = await productService.create('tenant123', productData);
      
      expect(result).toEqual(createdProduct);
      expect(productRepository.findBySlug).toHaveBeenCalledWith('new-product', 'tenant123');
      expect(productRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        tenantId: 'tenant123',
        name: 'New Product',
        slug: expect.stringMatching(/new-product-\d+/),
      }));
    });
  });

  describe('update', () => {
    it('deve atualizar um produto existente', async () => {
      const existingProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Old Product',
        description: 'Old description',
        price: 50,
        slug: 'old-product',
        categoryId: 'category123',
        type: ProductType.PHYSICAL,
        status: ProductStatus.ACTIVE,
      };

      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 75,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
        slug: 'updated-product',
      };

      productRepository.findById.mockResolvedValue(existingProduct);
      productRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.update('product123', 'tenant123', updateData);
      
      expect(result).toEqual(updatedProduct);
      expect(productRepository.findById).toHaveBeenCalledWith('product123', 'tenant123');
      expect(productRepository.update).toHaveBeenCalledWith('product123', 'tenant123', expect.objectContaining({
        name: 'Updated Product',
        description: 'Updated description',
        price: 75,
        slug: 'updated-product',
      }));
    });

    it('deve lançar NotFoundException quando o produto a ser atualizado não existir', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        productService.update('product123', 'tenant123', { name: 'Updated Product' })
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando a categoria atualizada não existir', async () => {
      const existingProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Old Product',
        categoryId: 'category123',
      };

      const updateData = {
        categoryId: 'category456',
      };

      productRepository.findById.mockResolvedValue(existingProduct);
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        productService.update('product123', 'tenant123', updateData)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover um produto existente', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
      };

      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.remove.mockResolvedValue(undefined);

      await productService.remove('product123', 'tenant123');
      
      expect(productRepository.findById).toHaveBeenCalledWith('product123', 'tenant123');
      expect(productRepository.remove).toHaveBeenCalledWith('product123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o produto a ser removido não existir', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        productService.remove('product123', 'tenant123')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('deve atualizar o estoque de um produto', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        manageInventory: true,
        stockQuantity: 10,
      };

      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.updateStock.mockResolvedValue(undefined);

      await productService.updateStock('product123', 'tenant123', 5);
      
      expect(productRepository.findById).toHaveBeenCalledWith('product123', 'tenant123');
      expect(productRepository.updateStock).toHaveBeenCalledWith('product123', 'tenant123', 5);
    });

    it('deve lançar BadRequestException quando o produto não gerencia inventário', async () => {
      const mockProduct = {
        id: 'product123',
        tenantId: 'tenant123',
        name: 'Test Product',
        manageInventory: false,
      };

      productRepository.findById.mockResolvedValue(mockProduct);

      await expect(
        productService.updateStock('product123', 'tenant123', 5)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkImport', () => {
    it('deve importar produtos em massa', async () => {
      const productsToImport = [
        {
          name: 'Product 1',
          price: 100,
          type: ProductType.PHYSICAL,
          status: ProductStatus.ACTIVE,
        },
        {
          name: 'Product 2',
          price: 200,
          categoryId: 'category123',
          type: ProductType.DIGITAL,
          status: ProductStatus.ACTIVE,
        },
      ];

      const mockCategory = {
        id: 'category123',
        tenantId: 'tenant123',
        name: 'Test Category',
      };

      categoryRepository.findById.mockResolvedValue(mockCategory);
      productRepository.findBySlug.mockResolvedValue(null);
      productRepository.bulkCreate.mockResolvedValue(undefined);

      const result = await productService.bulkImport('tenant123', productsToImport);
      
      expect(result).toEqual({ success: 2, failed: 0 });
      expect(productRepository.bulkCreate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          tenantId: 'tenant123',
          name: 'Product 1',
          price: 100,
          type: ProductType.PHYSICAL,
          status: ProductStatus.ACTIVE,
          slug: 'product-1',
        }),
        expect.objectContaining({
          tenantId: 'tenant123',
          name: 'Product 2',
          price: 200,
          categoryId: 'category123',
          type: ProductType.DIGITAL,
          status: ProductStatus.ACTIVE,
          slug: 'product-2',
        }),
      ]));
    });

    it('deve lidar com falhas na importação de produtos', async () => {
      const productsToImport = [
        {
          name: 'Product 1',
          price: 100,
          type: ProductType.PHYSICAL,
          status: ProductStatus.ACTIVE,
        },
        {
          name: 'Product 2',
          price: 200,
          categoryId: 'invalid-category',
          type: ProductType.DIGITAL,
          status: ProductStatus.ACTIVE,
        },
      ];

      categoryRepository.findById.mockResolvedValueOnce(null); // Categoria inválida
      productRepository.findBySlug.mockResolvedValue(null);
      productRepository.bulkCreate.mockResolvedValue(undefined);

      const result = await productService.bulkImport('tenant123', productsToImport);
      
      expect(result).toEqual({ success: 1, failed: 1 });
      expect(productRepository.bulkCreate).toHaveBeenCalledWith([
        expect.objectContaining({
          tenantId: 'tenant123',
          name: 'Product 1',
          price: 100,
          type: ProductType.PHYSICAL,
          status: ProductStatus.ACTIVE,
          slug: 'product-1',
        }),
      ]);
    });
  });

  describe('getDashboardStats', () => {
    it('deve retornar estatísticas de produtos para o dashboard', async () => {
      const mockProducts = [
        {
          id: 'product1',
          name: 'Physical Product',
          sku: 'SKU001',
          type: ProductType.PHYSICAL,
          manageInventory: true,
          stockQuantity: 3,
        },
        {
          id: 'product2',
          name: 'Digital Product',
          sku: 'SKU002',
          type: ProductType.DIGITAL,
          manageInventory: false,
        },
        {
          id: 'product3',
          name: 'Service Product',
          sku: 'SKU003',
          type: ProductType.SERVICE,
          manageInventory: false,
        },
      ];

      productRepository.countByTenant.mockResolvedValue(3);
      // Mock para produtos por tipo
      productRepository.findAll
        .mockResolvedValueOnce([[mockProducts[0]], 1]) // PHYSICAL
        .mockResolvedValueOnce([[mockProducts[1]], 1]) // DIGITAL
        .mockResolvedValueOnce([[mockProducts[2]], 1]) // SERVICE
        // Mock para produtos com baixo estoque
        .mockResolvedValueOnce([[{
          id: 'product1',
          name: 'Physical Product',
          sku: 'SKU001',
          type: ProductType.PHYSICAL,
          manageInventory: true,
          stockQuantity: 3,
        }], 1]);

      const result = await productService.getDashboardStats('tenant123');
      
      expect(result).toEqual({
        totalProducts: 3,
        productsByType: expect.arrayContaining([
          { type: ProductType.PHYSICAL, count: 1 },
          { type: ProductType.DIGITAL, count: 1 },
          { type: ProductType.SERVICE, count: 1 },
        ]),
        lowStock: [],
      });
    });
  });
});
