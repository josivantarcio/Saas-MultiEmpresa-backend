import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../../src/controllers/order.controller';
import { OrderService } from '../../src/services/order.service';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '../../src/entities/order.entity';
import { OrderItemStatus } from '../../src/entities/order-item.entity';

describe('OrderController (Unit)', () => {
  let orderController: OrderController;
  let orderService: OrderService;

  beforeEach(async () => {
    // Mock do OrderService com todas as funções necessárias
    const mockOrderService = {
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      updateStatus: jest.fn(),
      updatePaymentStatus: jest.fn(),
      updateFulfillmentStatus: jest.fn(),
      updateOrderItemStatus: jest.fn(),
      addTrackingInfo: jest.fn(),
      addAdminNotes: jest.fn(),
      cancelOrder: jest.fn(),
      refundOrder: jest.fn(),
      getOrderStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  describe('findAll', () => {
    it('deve retornar todos os pedidos com os filtros fornecidos', async () => {
      const mockOrders: any = [
        {
          id: 'order123',
          tenantId: 'tenant123',
          orderNumber: 'ORD-123456',
          status: OrderStatus.PROCESSING,
          total: 100,
        },
        {
          id: 'order456',
          tenantId: 'tenant123',
          orderNumber: 'ORD-456789',
          status: OrderStatus.COMPLETED,
          total: 200,
        },
      ];

      const filters = {
        skip: 0,
        take: 10,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'findAll').mockResolvedValue(mockOrders);

      const result = await orderController.findAll(
        req,
        filters.skip,
        filters.take,
        filters.status,
        filters.paymentStatus,
        undefined, // fulfillmentStatus
        filters.startDate,
        filters.endDate,
        undefined, // search
      );

      expect(result).toEqual(mockOrders);
      expect(orderService.findAll).toHaveBeenCalledWith('tenant123', {
        skip: filters.skip,
        take: filters.take,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        fulfillmentStatus: undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: undefined,
      });
    });
  });

  describe('findMyOrders', () => {
    it('deve retornar os pedidos do usuário atual', async () => {
      const mockOrders: any = [
        {
          id: 'order123',
          tenantId: 'tenant123',
          userId: 'user123',
          orderNumber: 'ORD-123456',
          status: OrderStatus.PROCESSING,
          total: 100,
        },
      ];

      const filters = {
        skip: 0,
        take: 10,
        status: OrderStatus.PROCESSING,
      };

      const req = { user: { tenantId: 'tenant123', id: 'user123' } };

      jest.spyOn(orderService, 'findByUserId').mockResolvedValue(mockOrders);

      const result = await orderController.findMyOrders(
        req,
        filters.skip,
        filters.take,
        filters.status,
      );

      expect(result).toEqual(mockOrders);
      expect(orderService.findByUserId).toHaveBeenCalledWith('user123', 'tenant123', {
        skip: filters.skip,
        take: filters.take,
        status: filters.status,
      });
    });
  });

  describe('findById', () => {
    it('deve retornar um pedido pelo ID', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        total: 100,
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'findById').mockResolvedValue(mockOrder);

      const result = await orderController.findById(req, 'order123');

      expect(result).toEqual(mockOrder);
      expect(orderService.findById).toHaveBeenCalledWith('order123', 'tenant123');
    });
  });

  describe('findByOrderNumber', () => {
    it('deve retornar um pedido pelo número do pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        total: 100,
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'findByOrderNumber').mockResolvedValue(mockOrder);

      const result = await orderController.findByOrderNumber(req, 'ORD-123456');

      expect(result).toEqual(mockOrder);
      expect(orderService.findByOrderNumber).toHaveBeenCalledWith('ORD-123456', 'tenant123');
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status do pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        total: 100,
      };

      const updateStatusDto = { status: OrderStatus.COMPLETED };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'updateStatus').mockResolvedValue(mockOrder);

      const result = await orderController.updateStatus(req, 'order123', updateStatusDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.updateStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        OrderStatus.COMPLETED
      );
    });
  });

  describe('updatePaymentStatus', () => {
    it('deve atualizar o status de pagamento do pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        total: 100,
      };

      const updatePaymentStatusDto = { 
        status: PaymentStatus.PAID,
        transactionId: 'txn123'
      };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'updatePaymentStatus').mockResolvedValue(mockOrder);

      const result = await orderController.updatePaymentStatus(req, 'order123', updatePaymentStatusDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.updatePaymentStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        PaymentStatus.PAID,
        'txn123'
      );
    });
  });

  describe('updateFulfillmentStatus', () => {
    it('deve atualizar o status de atendimento do pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
        total: 100,
      };

      const updateFulfillmentStatusDto = { status: FulfillmentStatus.FULFILLED };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'updateFulfillmentStatus').mockResolvedValue(mockOrder);

      const result = await orderController.updateFulfillmentStatus(req, 'order123', updateFulfillmentStatusDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.updateFulfillmentStatus).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        FulfillmentStatus.FULFILLED
      );
    });
  });

  describe('updateItemStatus', () => {
    it('deve atualizar o status de um item do pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        items: [
          {
            id: 'item123',
            status: OrderItemStatus.SHIPPED,
            productId: 'product123',
            name: 'Test Product',
            price: 100,
            quantity: 1,
          },
        ],
        total: 100,
      };

      const updateItemStatusDto = { status: OrderItemStatus.SHIPPED };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'updateOrderItemStatus').mockResolvedValue(mockOrder);

      const result = await orderController.updateItemStatus(req, 'order123', 'item123', updateItemStatusDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.updateOrderItemStatus).toHaveBeenCalledWith(
        'order123',
        'item123',
        'tenant123',
        OrderItemStatus.SHIPPED
      );
    });
  });

  describe('addTrackingInfo', () => {
    it('deve adicionar informações de rastreamento ao pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        trackingNumber: 'TRK123456',
        trackingUrl: 'https://tracking.example.com/TRK123456',
        estimatedDeliveryDate: new Date('2025-05-20'),
        total: 100,
      };

      const addTrackingInfoDto = {
        trackingNumber: 'TRK123456',
        trackingUrl: 'https://tracking.example.com/TRK123456',
        estimatedDeliveryDate: new Date('2025-05-20'),
      };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'addTrackingInfo').mockResolvedValue(mockOrder);

      const result = await orderController.addTrackingInfo(req, 'order123', addTrackingInfoDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.addTrackingInfo).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        addTrackingInfoDto
      );
    });
  });

  describe('addAdminNotes', () => {
    it('deve adicionar notas administrativas ao pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.PROCESSING,
        adminNotes: 'Contatar cliente antes da entrega',
        total: 100,
      };

      const addAdminNotesDto = { adminNotes: 'Contatar cliente antes da entrega' };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'addAdminNotes').mockResolvedValue(mockOrder);

      const result = await orderController.addAdminNotes(req, 'order123', addAdminNotesDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.addAdminNotes).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        'Contatar cliente antes da entrega'
      );
    });
  });

  describe('cancelOrder', () => {
    it('deve cancelar um pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.CANCELLED,
        cancelReason: 'Produto indisponível',
        total: 100,
      };

      const cancelOrderDto = { cancelReason: 'Produto indisponível' };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'cancelOrder').mockResolvedValue(mockOrder);

      const result = await orderController.cancelOrder(req, 'order123', cancelOrderDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.cancelOrder).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        'Produto indisponível'
      );
    });
  });

  describe('refundOrder', () => {
    it('deve reembolsar um pedido', async () => {
      const mockOrder: any = {
        id: 'order123',
        tenantId: 'tenant123',
        orderNumber: 'ORD-123456',
        status: OrderStatus.REFUNDED,
        refundAmount: 100,
        total: 100,
      };

      const refundOrderDto = { refundAmount: 100 };
      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'refundOrder').mockResolvedValue(mockOrder);

      const result = await orderController.refundOrder(req, 'order123', refundOrderDto);

      expect(result).toEqual(mockOrder);
      expect(orderService.refundOrder).toHaveBeenCalledWith(
        'order123',
        'tenant123',
        100
      );
    });
  });

  describe('getOrderStats', () => {
    it('deve retornar estatísticas de pedidos para o período especificado', async () => {
      const mockStats: any = {
        totalOrders: 10,
        totalRevenue: 1000,
        averageOrderValue: 100,
        periodComparison: {
          orderGrowth: 0.2,
          revenueGrowth: 0.15,
        },
        ordersByStatus: {
          [OrderStatus.PENDING]: 2,
          [OrderStatus.PROCESSING]: 3,
          [OrderStatus.COMPLETED]: 5,
        },
      };

      const req = { user: { tenantId: 'tenant123' } };

      jest.spyOn(orderService, 'getOrderStats').mockResolvedValue(mockStats);

      const result = await orderController.getOrderStats(req, 'month');

      expect(result).toEqual(mockStats);
      expect(orderService.getOrderStats).toHaveBeenCalledWith('tenant123', 'month');
    });
  });
});
