import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { DiscountOffersService } from './discount-offers.service';
import { DiscountOffer } from './discount-offer.schema';

const makeOffer = (overrides: Record<string, any> = {}) => ({
  _id: { toString: () => 'coupon-id-1' },
  code: 'FIRST20',
  description: '20% off for new customers',
  discountType: 'percent',
  discountValue: 20,
  minOrderAmount: 0,
  maxUses: null,
  usedCount: 0,
  isActive: true,
  validFrom: null,
  validUntil: null,
  ...overrides,
});

const chainable = (resolveValue: any) => ({
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(resolveValue),
});

describe('DiscountOffersService', () => {
  let service: DiscountOffersService;

  const modelMock: any = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        DiscountOffersService,
        { provide: getModelToken(DiscountOffer.name), useValue: modelMock },
      ],
    }).compile();

    service = moduleRef.get(DiscountOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAndApply (checkout rules)', () => {
    it('applies percent discount, rounds to 2 decimals, increments usage', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ discountValue: 20 }));
      const res = await service.validateAndApply('first20', 2499, true);

      expect(res.discountAmount).toBe(499.8);
      expect(res.code).toBe('FIRST20');
      expect(modelMock.updateOne).toHaveBeenCalledWith(
        { _id: expect.anything() },
        { $inc: { usedCount: 1 } }
      );
    });

    it('applies fixed discount capped at subtotal', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ discountType: 'fixed', discountValue: 500 }));
      const res = await service.validateAndApply('FLAT500', 300);
      expect(res.discountAmount).toBe(300);
    });

    it('gives full fixed discount when subtotal covers it', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ discountType: 'fixed', discountValue: 500 }));
      const res = await service.validateAndApply('FLAT500', 2499);
      expect(res.discountAmount).toBe(500);
    });

    it('rejects unknown coupon codes', async () => {
      modelMock.findOne.mockResolvedValue(null);
      await expect(service.validateAndApply('NOPE', 1000)).rejects.toThrow(BadRequestException);
    });

    it('rejects inactive coupons', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ isActive: false }));
      await expect(service.validateAndApply('FIRST20', 1000)).rejects.toThrow('no longer active');
    });

    it('rejects expired coupons', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ validUntil: new Date(Date.now() - 86400000) }));
      await expect(service.validateAndApply('FIRST20', 1000)).rejects.toThrow('expired');
    });

    it('rejects not-yet-valid coupons', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ validFrom: new Date(Date.now() + 86400000) }));
      await expect(service.validateAndApply('FIRST20', 1000)).rejects.toThrow('not yet valid');
    });

    it('rejects when usage limit reached', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ maxUses: 100, usedCount: 100 }));
      await expect(service.validateAndApply('FIRST20', 1000)).rejects.toThrow('usage limit');
    });

    it('rejects below minimum order amount', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer({ minOrderAmount: 1999 }));
      await expect(service.validateAndApply('FIRST20', 999)).rejects.toThrow('Minimum order amount');
    });

    it('does NOT increment usage when incrementUsage=false', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer());
      await service.validateAndApply('FIRST20', 1000, false);
      expect(modelMock.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('preview (public cart endpoint)', () => {
    it('returns discount + description without incrementing usage', async () => {
      const offer = makeOffer({ code: 'FLAT500', discountType: 'fixed', discountValue: 500, description: 'Flat 500 off' });
      modelMock.findOne.mockResolvedValue(offer);

      const res = await service.preview('FLAT500', 2499);

      expect(res).toEqual({ discountAmount: 500, code: 'FLAT500', description: 'Flat 500 off' });
      expect(modelMock.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('uppercases the code and creates the coupon', async () => {
      modelMock.findOne.mockResolvedValue(null);
      modelMock.create.mockImplementation(async (data) => makeOffer(data));

      const res = await service.create({ code: 'diwali25', discountValue: 25 } as any);

      expect(modelMock.create).toHaveBeenCalledWith(expect.objectContaining({ code: 'DIWALI25' }));
      expect(res.code).toBe('DIWALI25');
    });

    it('rejects duplicate codes with ConflictException', async () => {
      modelMock.findOne.mockResolvedValue(makeOffer());
      await expect(service.create({ code: 'FIRST20', discountValue: 10 } as any)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('crud basics', () => {
    it('findOne throws NotFoundException when missing', async () => {
      modelMock.findById.mockReturnValue({ exec: () => Promise.resolve(null) });
      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
    });

    it('update returns the updated doc', async () => {
      const updated = makeOffer({ isActive: false });
      modelMock.findByIdAndUpdate.mockReturnValue({ exec: () => Promise.resolve(updated) });
      const res = await service.update('coupon-id-1', { isActive: false } as any);
      expect(res.isActive).toBe(false);
    });

    it('update throws when doc missing', async () => {
      modelMock.findByIdAndUpdate.mockReturnValue({ exec: () => Promise.resolve(null) });
      await expect(service.update('ghost', { isActive: true } as any)).rejects.toThrow(NotFoundException);
    });

    it('remove throws when doc missing', async () => {
      modelMock.findByIdAndDelete.mockReturnValue({ exec: () => Promise.resolve(null) });
      await expect(service.remove('ghost')).rejects.toThrow(NotFoundException);
    });

    it('findAll filters inactive by default', async () => {
      modelMock.find.mockReturnValue(chainable([]));
      await service.findAll({});
      expect(modelMock.find).toHaveBeenCalledWith({ isActive: true });
    });

    it('findAll includes inactive when requested', async () => {
      modelMock.find.mockReturnValue(chainable([]));
      await service.findAll({ includeInactive: true });
      expect(modelMock.find).toHaveBeenCalledWith({});
    });
  });
});
