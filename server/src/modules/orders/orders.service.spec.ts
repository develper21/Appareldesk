import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Order } from './order.schema';
import { ProductsService } from '../products/products.service';
import { DiscountOffersService } from '../discount-offers/discount-offers.service';

const UID = 'aaa1b2c3d4e5f6a7b8c9d0e1';
const PID1 = 'a1b2c3d4e5f6a7b8c9d0e1f2'; // valid 24-hex ObjectId
const PID_MISSING = 'f1e2d3c4b5a6978877665544';
const CID = 'bbb1c2d3e4f5a6b7c8d9e0f1';

const makeProduct = (id: string, overrides: Record<string, any> = {}) => ({
  _id: id,
  name: `Product ${id.slice(0, 4)}`,
  price: 100,
  stockQuantity: 10,
  ...overrides,
});

describe('OrdersService (checkout logic)', () => {
  let service: OrdersService;

  const orderModelMock: any = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const productsServiceMock = {
    findByIds: jest.fn(),
    decrementStock: jest.fn().mockResolvedValue(undefined),
  };

  const discountServiceMock = {
    validateAndApply: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModelMock },
        { provide: ProductsService, useValue: productsServiceMock },
        { provide: DiscountOffersService, useValue: discountServiceMock },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromCart', () => {
    it('rejects an empty cart', async () => {
      await expect(service.createFromCart(UID, { items: [] } as any)).rejects.toThrow(
        BadRequestException
      );
    });

    it('rejects unknown products', async () => {
      productsServiceMock.findByIds.mockResolvedValue([]);

      await expect(
        service.createFromCart(UID, { items: [{ productId: PID_MISSING, quantity: 1 }] } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects when stock is insufficient', async () => {
      productsServiceMock.findByIds.mockResolvedValue([makeProduct(PID1, { stockQuantity: 1 })]);

      await expect(
        service.createFromCart(UID, { items: [{ productId: PID1, quantity: 5 }] } as any)
      ).rejects.toThrow('Insufficient stock');
    });

    it('prices from DB, applies coupon tax and decrements stock', async () => {
      productsServiceMock.findByIds.mockResolvedValue([makeProduct(PID1, { price: 500 })]);
      discountServiceMock.validateAndApply.mockResolvedValue({ discountAmount: 100, code: 'FIRST20' });
      orderModelMock.create.mockImplementation(async (data) => data);
      (service as any).nextOrderNumber = jest.fn().mockResolvedValue('ORD-2026-00001');

      const order = await service.createFromCart(UID, {
        items: [{ productId: PID1, quantity: 2 }],
        couponCode: 'FIRST20',
        taxAmount: 50,
        shippingAddress: { fullName: 'Rahul', paymentMethod: 'upi' },
      } as any);

      // 2 x 500 = 1000 subtotal, -100 coupon, +50 tax
      expect(order.subtotal).toBe(1000);
      expect(order.discountAmount).toBe(100);
      expect(order.totalAmount).toBe(950);
      expect(order.status).toBe('confirmed');
      expect(order.couponCode).toBe('FIRST20');
      expect(order.items[0].unitPrice).toBe(500); // DB price, not client price
      expect(productsServiceMock.decrementStock).toHaveBeenCalledWith(PID1, 2);
    });

    it('computes totals without coupon', async () => {
      productsServiceMock.findByIds.mockResolvedValue([makeProduct(PID1, { price: 250 })]);
      orderModelMock.create.mockImplementation(async (data) => data);
      (service as any).nextOrderNumber = jest.fn().mockResolvedValue('ORD-2026-00002');

      const order = await service.createFromCart(UID, {
        items: [{ productId: PID1, quantity: 3 }],
      } as any);

      expect(order.subtotal).toBe(750);
      expect(order.discountAmount).toBe(0);
      expect(order.totalAmount).toBe(750);
      expect(order.couponCode).toBeNull();
    });
  });

  describe('createForCustomer (admin)', () => {
    it('requires customerId', async () => {
      await expect(
        service.createForCustomer({ items: [{ productId: PID1, quantity: 1 }] } as any)
      ).rejects.toThrow('customerId is required');
    });

    it('creates the order without coupon logic', async () => {
      productsServiceMock.findByIds.mockResolvedValue([makeProduct(PID1, { price: 300 })]);
      orderModelMock.create.mockImplementation(async (data) => data);
      (service as any).nextOrderNumber = jest.fn().mockResolvedValue('ORD-2026-00003');

      const order = await service.createForCustomer({
        customerId: CID,
        items: [{ productId: PID1, quantity: 2 }],
        taxAmount: 20,
      } as any);

      expect(order.totalAmount).toBe(620);
      expect(order.discountAmount).toBe(0);
      expect(discountServiceMock.validateAndApply).not.toHaveBeenCalled();
    });
  });
});
