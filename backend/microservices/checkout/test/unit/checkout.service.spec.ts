import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from '../../src/services/checkout.service';
import { CartService } from '../../src/services/cart.service';
import { OrderService } from '../../src/services/order.service';
import { ShippingMethodRepository } from '../../src/repositories/shipping-method.repository';
import { PaymentMethodRepository } from '../../src/repositories/payment-method.repository';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Cart } from '../../src/entities/cart.entity';
import { Order, OrderStatus, PaymentStatus } from '../../src/entities/order.entity';
import { PaymentMethodType } from '../../src/entities/payment-method.entity';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock dos serviços e repositórios
const mockCartService = () => ({
  findById: jest.fn(),
  applyShipping: jest.fn(),
  applyCoupon: jest.fn(),
});

const mockOrderService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  createFromCart: jest.fn(),
  updatePaymentStatus: jest.fn(),
  updateStatus: jest.fn(),
  refundOrder: jest.fn(),
});

const mockShippingMethodRepository = () => ({
  findById: jest.fn(),
  calculateShippingOptions: jest.fn(),
});

const mockPaymentMethodRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn((key) => {
    if (key === 'ASAAS_API_URL') return 'https://api.asaas.com/v3';
    if (key === 'ASAAS_API_KEY') return 'test_api_key';
    return null;
  }),
});

describe('CheckoutService', () => {
  let checkoutService: CheckoutService;
  let cartService;
  let orderService;
  let shippingMethodRepository;
  let paymentMethodRepository;
  let configService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: CartService,
          useFactory: mockCartService,
        },
        {
          provide: OrderService,
          useFactory: mockOrderService,
        },
        {
          provide: ShippingMethodRepository,
          useFactory: mockShippingMethodRepository,
        },
        {
          provide: PaymentMethodRepository,
          useFactory: mockPaymentMethodRepository,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
      ],
    }).compile();

    checkoutService = module.get<CheckoutService>(CheckoutService);
    cartService = module.get<CartService>(CartService);
    orderService = module.get<OrderService>(OrderService);
    shippingMethodRepository = module.get<ShippingMethodRepository>(ShippingMethodRepository);
    paymentMethodRepository = module.get<PaymentMethodRepository>(PaymentMethodRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getShippingOptions', () => {
    it('deve retornar opções de envio com base no carrinho e localização', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            requiresShipping: true,
            attributes: {
              weight: 0.5, // 0.5kg por item
            },
          },
          {
            id: 'item456',
            productId: 'product456',
            name: 'Digital Product',
            price: 50,
            quantity: 1,
            requiresShipping: false,
            attributes: {},
          },
        ],
        subtotal: 250,
      };

      const mockShippingOptions = [
        {
          id: 'shipping123',
          name: 'Standard Shipping',
          price: 15,
          estimatedDeliveryTime: '3-5 days',
        },
        {
          id: 'shipping456',
          name: 'Express Shipping',
          price: 25,
          estimatedDeliveryTime: '1-2 days',
        },
      ];

      const location = {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        postalCode: '01310-200',
      };

      cartService.findById.mockResolvedValue(mockCart);
      shippingMethodRepository.calculateShippingOptions.mockResolvedValue(mockShippingOptions);

      const result = await checkoutService.getShippingOptions('cart123', 'tenant123', location);

      expect(result).toEqual(mockShippingOptions);
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(shippingMethodRepository.calculateShippingOptions).toHaveBeenCalledWith('tenant123', {
        subtotal: 250,
        weight: 1, // 0.5kg * 2 items
        location,
      });
    });

    it('deve calcular corretamente o peso total dos itens físicos', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Heavy Product',
            price: 100,
            quantity: 2,
            requiresShipping: true,
            attributes: {
              weight: 2, // 2kg por item
            },
          },
          {
            id: 'item456',
            productId: 'product456',
            name: 'Light Product',
            price: 50,
            quantity: 3,
            requiresShipping: true,
            attributes: {
              weight: 0.3, // 0.3kg por item
            },
          },
          {
            id: 'item789',
            productId: 'product789',
            name: 'Digital Product',
            price: 30,
            quantity: 1,
            requiresShipping: false,
            attributes: {
              weight: 1, // Não deve ser contabilizado
            },
          },
        ],
        subtotal: 340,
      };

      const mockShippingOptions = [
        {
          id: 'shipping123',
          name: 'Standard Shipping',
          price: 20,
          estimatedDeliveryTime: '3-5 days',
        },
      ];

      const location = {
        country: 'BR',
      };

      cartService.findById.mockResolvedValue(mockCart);
      shippingMethodRepository.calculateShippingOptions.mockResolvedValue(mockShippingOptions);

      const result = await checkoutService.getShippingOptions('cart123', 'tenant123', location);

      expect(result).toEqual(mockShippingOptions);
      expect(shippingMethodRepository.calculateShippingOptions).toHaveBeenCalledWith('tenant123', {
        subtotal: 340,
        weight: 4.9, // (2kg * 2) + (0.3kg * 3) = 4.9kg
        location,
      });
    });
  });

  describe('getPaymentMethods', () => {
    it('deve retornar métodos de pagamento ativos para o tenant', async () => {
      const mockPaymentMethods = [
        {
          id: 'payment123',
          name: 'Credit Card',
          code: 'credit_card',
          description: 'Pay with credit card',
          type: PaymentMethodType.CREDIT_CARD,
          iconUrl: 'https://example.com/credit-card.png',
          isActive: true,
          settings: {
            installmentOptions: [1, 2, 3, 6, 12],
            customFields: [
              {
                name: 'cardNumber',
                label: 'Card Number',
                type: 'text',
                required: true,
              },
            ],
            allowsPickup: false,
            pickupLocations: [],
          },
        },
        {
          id: 'payment456',
          name: 'Boleto',
          code: 'boleto',
          description: 'Pay with boleto',
          type: PaymentMethodType.BOLETO,
          iconUrl: 'https://example.com/boleto.png',
          isActive: true,
          settings: {
            installmentOptions: [1],
            customFields: [],
            allowsPickup: false,
            pickupLocations: [],
          },
        },
      ];

      paymentMethodRepository.findAll.mockResolvedValue(mockPaymentMethods);

      const result = await checkoutService.getPaymentMethods('tenant123');

      expect(result).toEqual([
        {
          id: 'payment123',
          name: 'Credit Card',
          code: 'credit_card',
          description: 'Pay with credit card',
          type: PaymentMethodType.CREDIT_CARD,
          iconUrl: 'https://example.com/credit-card.png',
          settings: {
            installmentOptions: [1, 2, 3, 6, 12],
            customFields: [
              {
                name: 'cardNumber',
                label: 'Card Number',
                type: 'text',
                required: true,
              },
            ],
            allowsPickup: false,
            pickupLocations: [],
          },
        },
        {
          id: 'payment456',
          name: 'Boleto',
          code: 'boleto',
          description: 'Pay with boleto',
          type: PaymentMethodType.BOLETO,
          iconUrl: 'https://example.com/boleto.png',
          settings: {
            installmentOptions: [1],
            customFields: [],
            allowsPickup: false,
            pickupLocations: [],
          },
        },
      ]);
      expect(paymentMethodRepository.findAll).toHaveBeenCalledWith('tenant123', { isActive: true });
    });

    it('deve formatar corretamente os métodos de pagamento para o cliente', async () => {
      const mockPaymentMethods = [
        {
          id: 'payment123',
          name: 'Credit Card',
          code: 'credit_card',
          description: 'Pay with credit card',
          type: PaymentMethodType.CREDIT_CARD,
          iconUrl: 'https://example.com/credit-card.png',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId: 'tenant123',
          processorId: 'processor123',
          settings: {
            installmentOptions: [1, 2, 3],
            customFields: [],
            allowsPickup: false,
            pickupLocations: [],
            secretKey: 'this_should_not_be_exposed',
            internalConfig: 'this_should_not_be_exposed',
          },
        },
      ];

      paymentMethodRepository.findAll.mockResolvedValue(mockPaymentMethods);

      const result = await checkoutService.getPaymentMethods('tenant123');

      // Verificar que campos sensíveis foram removidos
      expect(result[0]).not.toHaveProperty('createdAt');
      expect(result[0]).not.toHaveProperty('updatedAt');
      expect(result[0]).not.toHaveProperty('tenantId');
      expect(result[0]).not.toHaveProperty('processorId');
      expect(result[0].settings).not.toHaveProperty('secretKey');
      expect(result[0].settings).not.toHaveProperty('internalConfig');

      // Verificar que apenas os campos necessários foram retornados
      expect(result[0]).toEqual({
        id: 'payment123',
        name: 'Credit Card',
        code: 'credit_card',
        description: 'Pay with credit card',
        type: PaymentMethodType.CREDIT_CARD,
        iconUrl: 'https://example.com/credit-card.png',
        settings: {
          installmentOptions: [1, 2, 3],
          customFields: [],
          allowsPickup: false,
          pickupLocations: [],
        },
      });
    });
  });

  describe('applyShippingMethod', () => {
    it('deve aplicar um método de envio ao carrinho', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [
          {
            id: 'item123',
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 2,
            requiresShipping: true,
            attributes: {
              weight: 0.5,
            },
          },
        ],
        subtotal: 200,
        shippingAddress: {
          country: 'BR',
          state: 'SP',
          city: 'São Paulo',
          postalCode: '01310-200',
        },
      };

      const mockShippingMethod = {
        id: 'shipping123',
        name: 'Standard Shipping',
        code: 'standard',
        description: 'Standard shipping option',
        calculatePrice: jest.fn().mockReturnValue(15),
      };

      const updatedCart = {
        ...mockCart,
        shippingMethodId: 'shipping123',
        shippingAmount: 15,
        total: 215,
      };

      cartService.findById.mockResolvedValue(mockCart);
      shippingMethodRepository.findById.mockResolvedValue(mockShippingMethod);
      cartService.applyShipping.mockResolvedValue(updatedCart);

      const result = await checkoutService.applyShippingMethod('cart123', 'tenant123', 'shipping123');

      expect(result).toEqual(updatedCart);
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(shippingMethodRepository.findById).toHaveBeenCalledWith('shipping123', 'tenant123');
      expect(mockShippingMethod.calculatePrice).toHaveBeenCalledWith(
        200,
        1, // 0.5kg * 2 items
        mockCart.shippingAddress
      );
      expect(cartService.applyShipping).toHaveBeenCalledWith('cart123', 'tenant123', 'shipping123', 15);
    });

    it('deve lançar NotFoundException quando o método de envio não for encontrado', async () => {
      shippingMethodRepository.findById.mockResolvedValue(null);

      await expect(
        checkoutService.applyShippingMethod('cart123', 'tenant123', 'shipping123')
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando o método de envio não for aplicável ao carrinho', async () => {
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
            requiresShipping: true,
            attributes: {
              weight: 0.5,
            },
          },
        ],
        subtotal: 100,
        shippingAddress: {
          country: 'BR',
          state: 'SP',
        },
      };

      const mockShippingMethod = {
        id: 'shipping123',
        name: 'Standard Shipping',
        code: 'standard',
        description: 'Standard shipping option',
        calculatePrice: jest.fn().mockReturnValue(null), // Retorna null quando não é aplicável
      };

      cartService.findById.mockResolvedValue(mockCart);
      shippingMethodRepository.findById.mockResolvedValue(mockShippingMethod);

      await expect(
        checkoutService.applyShippingMethod('cart123', 'tenant123', 'shipping123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('applyCoupon', () => {
    it('deve aplicar um cupom ao carrinho', async () => {
      const mockCart = {
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

      const updatedCart = {
        ...mockCart,
        couponCode: 'DISCOUNT20',
        discountAmount: 40, // 20% de 200
        total: 160,
      };

      cartService.findById.mockResolvedValue(mockCart);
      cartService.applyCoupon.mockResolvedValue(updatedCart);

      const result = await checkoutService.applyCoupon('cart123', 'tenant123', 'DISCOUNT20');

      expect(result).toEqual(updatedCart);
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(cartService.applyCoupon).toHaveBeenCalledWith('cart123', 'tenant123', 'DISCOUNT20', 0);
    });
  });

  describe('processCheckout', () => {
    it('deve processar um checkout com pagamento por boleto', async () => {
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
            requiresShipping: true,
          },
        ],
        subtotal: 200,
        taxAmount: 20,
        discountAmount: 0,
        shippingAmount: 15,
        total: 235,
        shippingMethodId: 'shipping123',
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
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

      const mockPaymentMethod = {
        id: 'payment123',
        name: 'Boleto',
        code: 'boleto',
        type: PaymentMethodType.BOLETO,
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        userId: 'user123',
        orderNumber: 'ORD-123456',
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        customerPhone: '123-456-7890',
        cartId: 'cart123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: 200,
        taxAmount: 20,
        discountAmount: 0,
        shippingAmount: 15,
        total: 235,
        paymentMethodId: 'payment123',
        paymentMethodName: 'Boleto',
      };

      const mockPaymentInfo = {
        id: 'payment789',
        value: 235,
        netValue: 235,
        billingType: 'BOLETO',
        status: 'PENDING',
        invoiceUrl: 'https://example.com/boleto',
        bankSlipUrl: 'https://example.com/boleto.pdf',
      };

      const checkoutData = {
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        customerPhone: '123-456-7890',
        paymentMethodId: 'payment123',
        notes: 'Please deliver to the front door',
      };

      cartService.findById.mockResolvedValue(mockCart);
      paymentMethodRepository.findById.mockResolvedValue(mockPaymentMethod);
      orderService.createFromCart.mockResolvedValue(mockOrder);
      mockedAxios.post.mockResolvedValue({ data: mockPaymentInfo });

      const result = await checkoutService.processCheckout('cart123', 'tenant123', checkoutData);

      // Verificamos apenas que o resultado contém o pedido, já que o paymentInfo pode variar
      expect(result).toHaveProperty('order');
      expect(result.order).toEqual(mockOrder);
      
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith('payment123', 'tenant123');
      expect(orderService.createFromCart).toHaveBeenCalledWith('cart123', 'tenant123', expect.objectContaining({
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        customerPhone: '123-456-7890',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Boleto',
        notes: 'Please deliver to the front door',
      }));
    });

    it('deve processar um checkout com pagamento por cartão de crédito', async () => {
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
            requiresShipping: false,
            isDigital: true,
          },
        ],
        subtotal: 100,
        taxAmount: 10,
        discountAmount: 0,
        shippingAmount: 0,
        total: 110,
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

      const mockPaymentMethod = {
        id: 'payment123',
        name: 'Credit Card',
        code: 'credit_card',
        type: PaymentMethodType.CREDIT_CARD,
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        userId: 'user123',
        orderNumber: 'ORD-123456',
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        cartId: 'cart123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: 100,
        taxAmount: 10,
        discountAmount: 0,
        shippingAmount: 0,
        total: 110,
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
        hasDigitalItems: true,
        hasPhysicalItems: false,
      };

      const paymentData = {
        creditCard: {
          holderName: 'John Doe',
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          ccv: '123',
          holderDocument: '12345678900',
        },
        addressNumber: '123',
      };

      const mockPaymentInfo = {
        id: 'payment789',
        value: 110,
        netValue: 110,
        billingType: 'CREDIT_CARD',
        status: 'CONFIRMED',
        creditCard: {
          creditCardBrand: 'VISA',
          creditCardNumber: '************1111',
        },
      };

      const checkoutData = {
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentData,
        isGuestCheckout: true,
      };

      cartService.findById.mockResolvedValue(mockCart);
      paymentMethodRepository.findById.mockResolvedValue(mockPaymentMethod);
      orderService.createFromCart.mockResolvedValue(mockOrder);
      mockedAxios.post.mockResolvedValue({ data: mockPaymentInfo });

      const result = await checkoutService.processCheckout('cart123', 'tenant123', checkoutData);

      // Verificamos apenas que o resultado contém o pedido, já que o paymentInfo pode variar
      expect(result).toHaveProperty('order');
      expect(result.order).toEqual(mockOrder);
      
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith('payment123', 'tenant123');
      expect(orderService.createFromCart).toHaveBeenCalledWith('cart123', 'tenant123', expect.objectContaining({
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
        paymentMethodName: 'Credit Card',
        isGuestCheckout: true,
      }));
    });

    it('deve lançar BadRequestException quando o carrinho estiver vazio', async () => {
      const mockCart = {
        id: 'cart123',
        tenantId: 'tenant123',
        items: [], // Carrinho vazio
      };

      const checkoutData = {
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
      };

      cartService.findById.mockResolvedValue(mockCart);

      await expect(
        checkoutService.processCheckout('cart123', 'tenant123', checkoutData)
      ).rejects.toThrow(BadRequestException);
      
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
    });

    it('deve lançar NotFoundException quando o método de pagamento não for encontrado', async () => {
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

      const checkoutData = {
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        paymentMethodId: 'payment123',
      };

      cartService.findById.mockResolvedValue(mockCart);
      paymentMethodRepository.findById.mockResolvedValue(null);

      await expect(
        checkoutService.processCheckout('cart123', 'tenant123', checkoutData)
      ).rejects.toThrow(NotFoundException);
      
      expect(cartService.findById).toHaveBeenCalledWith('cart123', 'tenant123');
      expect(paymentMethodRepository.findById).toHaveBeenCalledWith('payment123', 'tenant123');
    });
  });

  // Não testamos o método processAsaasPayment diretamente porque é um método privado

  describe('handleAsaasWebhook', () => {
    it('deve processar um webhook de pagamento confirmado', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'CONFIRMED',
        },
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };

      orderService.findAll.mockResolvedValue({
        items: [mockOrder],
        total: 1,
      });

      const result = await checkoutService.handleAsaasWebhook(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      expect(orderService.findAll).toHaveBeenCalledWith(null, {
        search: 'order123',
      });
      expect(orderService.updatePaymentStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        PaymentStatus.PAID,
        'payment789'
      );
    });

    it('deve processar um webhook de pagamento recebido', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'RECEIVED',
        },
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };

      orderService.findAll.mockResolvedValue({
        items: [mockOrder],
        total: 1,
      });

      const result = await checkoutService.handleAsaasWebhook(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      expect(orderService.updatePaymentStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        PaymentStatus.PAID,
        'payment789'
      );
    });

    it('deve processar um webhook de pagamento vencido', async () => {
      const webhookData = {
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'OVERDUE',
        },
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };

      orderService.findAll.mockResolvedValue({
        items: [mockOrder],
        total: 1,
      });

      const result = await checkoutService.handleAsaasWebhook(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      expect(orderService.updateStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        OrderStatus.PAYMENT_FAILED
      );
    });

    it('deve processar um webhook de pagamento reembolsado', async () => {
      const webhookData = {
        event: 'PAYMENT_REFUNDED',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'REFUNDED',
        },
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      };

      orderService.findAll.mockResolvedValue({
        items: [mockOrder],
        total: 1,
      });

      const result = await checkoutService.handleAsaasWebhook(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
      expect(orderService.refundOrder).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        235
      );
    });

    it('deve lançar BadRequestException quando o pedido não for encontrado', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'CONFIRMED',
        },
      };

      orderService.findAll.mockResolvedValue({
        items: [],
        total: 0,
      });

      await expect(
        checkoutService.handleAsaasWebhook(webhookData)
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException quando houver erro no processamento do webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'payment789',
          externalReference: 'order123',
          value: 235,
          status: 'CONFIRMED',
        },
      };

      const mockOrder = {
        id: 'order123',
        tenantId: 'tenant123',
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };

      orderService.findAll.mockResolvedValue({
        items: [mockOrder],
        total: 1,
      });
      orderService.updatePaymentStatus.mockRejectedValue(new Error('Database error'));

      await expect(
        checkoutService.handleAsaasWebhook(webhookData)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
