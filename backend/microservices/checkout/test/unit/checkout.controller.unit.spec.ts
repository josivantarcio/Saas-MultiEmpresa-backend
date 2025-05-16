import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from '../../src/controllers/checkout.controller';
import { CheckoutService } from '../../src/services/checkout.service';

describe('CheckoutController (Unit)', () => {
  let checkoutController: CheckoutController;
  let checkoutService: CheckoutService;

  beforeEach(async () => {
    // Mock do CheckoutService com todas as funções necessárias
    const mockCheckoutService = {
      getShippingOptions: jest.fn(),
      getPaymentMethods: jest.fn(),
      applyShippingMethod: jest.fn(),
      applyCoupon: jest.fn(),
      processCheckout: jest.fn(),
      handleAsaasWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
      ],
    }).compile();

    checkoutController = module.get<CheckoutController>(CheckoutController);
    checkoutService = module.get<CheckoutService>(CheckoutService);
  });

  describe('getShippingOptions', () => {
    it('deve retornar opções de envio para a localização fornecida', async () => {
      const mockShippingOptions: any = [
        {
          id: 'shipping1',
          name: 'Frete Padrão',
          price: 15.90,
          estimatedDelivery: '3-5 dias úteis',
        },
        {
          id: 'shipping2',
          name: 'Frete Expresso',
          price: 25.90,
          estimatedDelivery: '1-2 dias úteis',
        },
      ];

      const locationDto = {
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        postalCode: '01000-000',
      };

      const req = { user: { tenantId: 'tenant123' } };
      const cartId = 'cart123';

      jest.spyOn(checkoutService, 'getShippingOptions').mockResolvedValue(mockShippingOptions);

      const result = await checkoutController.getShippingOptions(req, cartId, locationDto);

      expect(result).toEqual(mockShippingOptions);
      expect(checkoutService.getShippingOptions).toHaveBeenCalledWith(cartId, 'tenant123', locationDto);
    });
  });

  describe('getPaymentMethods', () => {
    it('deve retornar métodos de pagamento disponíveis', async () => {
      const mockPaymentMethods: any = [
        {
          id: 'payment1',
          name: 'Cartão de Crédito',
          type: 'credit_card',
          isActive: true,
        },
        {
          id: 'payment2',
          name: 'Boleto Bancário',
          type: 'boleto',
          isActive: true,
        },
        {
          id: 'payment3',
          name: 'PIX',
          type: 'pix',
          isActive: true,
        },
      ];

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(checkoutService, 'getPaymentMethods').mockResolvedValue(mockPaymentMethods);

      const result = await checkoutController.getPaymentMethods(req);

      expect(result).toEqual(mockPaymentMethods);
      expect(checkoutService.getPaymentMethods).toHaveBeenCalledWith('tenant123');
    });
  });

  describe('applyShippingMethod', () => {
    it('deve aplicar o método de envio ao carrinho', async () => {
      const mockCart: any = {
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
        shippingAmount: 15.90,
        total: 115.90,
        shippingMethodId: 'shipping1',
      };

      const applyShippingMethodDto = { shippingMethodId: 'shipping1' };
      const req = { user: { tenantId: 'tenant123' } };
      const cartId = 'cart123';

      jest.spyOn(checkoutService, 'applyShippingMethod').mockResolvedValue(mockCart);

      const result = await checkoutController.applyShippingMethod(req, cartId, applyShippingMethodDto);

      expect(result).toEqual(mockCart);
      expect(checkoutService.applyShippingMethod).toHaveBeenCalledWith(cartId, 'tenant123', 'shipping1');
    });
  });

  describe('applyCoupon', () => {
    it('deve aplicar o cupom ao carrinho', async () => {
      const mockCart: any = {
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
        total: 90,
        couponCode: 'DESCONTO10',
      };

      const applyCouponDto = { couponCode: 'DESCONTO10' };
      const req = { user: { tenantId: 'tenant123' } };
      const cartId = 'cart123';

      jest.spyOn(checkoutService, 'applyCoupon').mockResolvedValue(mockCart);

      const result = await checkoutController.applyCoupon(req, cartId, applyCouponDto);

      expect(result).toEqual(mockCart);
      expect(checkoutService.applyCoupon).toHaveBeenCalledWith(cartId, 'tenant123', 'DESCONTO10');
    });
  });

  describe('processCheckout', () => {
    it('deve processar o checkout e criar um pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        customerEmail: 'cliente@exemplo.com',
        customerName: 'Cliente Teste',
        total: 115.90,
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

      const processCheckoutDto = {
        customerEmail: 'cliente@exemplo.com',
        customerName: 'Cliente Teste',
        customerPhone: '11999999999',
        paymentMethodId: 'payment1',
        paymentData: {
          creditCard: {
            holderName: 'CLIENTE TESTE',
            number: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2030',
            ccv: '123',
            holderDocument: '12345678900',
          },
          installments: 1,
        },
        notes: 'Entregar no período da tarde',
        isGuestCheckout: false,
      };

      const req = { user: { tenantId: 'tenant123' } };
      const cartId = 'cart123';

      jest.spyOn(checkoutService, 'processCheckout').mockResolvedValue(mockOrder);

      const result = await checkoutController.processCheckout(req, cartId, processCheckoutDto);

      expect(result).toEqual(mockOrder);
      expect(checkoutService.processCheckout).toHaveBeenCalledWith(cartId, 'tenant123', processCheckoutDto);
    });
  });

  describe('handleAsaasWebhook', () => {
    it('deve processar o webhook do Asaas', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_123456',
          customer: 'cus_123456',
          value: 115.90,
          netValue: 112.50,
          billingType: 'CREDIT_CARD',
          status: 'CONFIRMED',
          externalReference: 'order123',
        },
      };

      const mockResponse = { success: true, message: 'Webhook processado com sucesso' };

      jest.spyOn(checkoutService, 'handleAsaasWebhook').mockResolvedValue(mockResponse);

      const result = await checkoutController.handleAsaasWebhook(webhookData);

      expect(result).toEqual(mockResponse);
      expect(checkoutService.handleAsaasWebhook).toHaveBeenCalledWith(webhookData);
    });
  });
});
