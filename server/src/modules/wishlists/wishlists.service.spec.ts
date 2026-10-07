import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WishlistsService } from './wishlists.service';
import { Wishlist } from './wishlist.schema';

const uid = new Types.ObjectId().toString();
const pid = new Types.ObjectId().toString();

const chainable = (resolveValue: any) => {
  const chain: any = {
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolveValue),
  };
  return chain;
};

describe('WishlistsService', () => {
  let service: WishlistsService;

  const modelMock: any = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [WishlistsService, { provide: getModelToken(Wishlist.name), useValue: modelMock }],
    }).compile();

    service = moduleRef.get(WishlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add (idempotent upsert)', () => {
    it('upserts on user+product with $setOnInsert', async () => {
      modelMock.findOneAndUpdate.mockResolvedValue({ _id: 'w1' });

      await service.add(uid, { productId: pid, productName: 'Kurta', priceAtAdd: 1299 } as any);

      expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: expect.any(Types.ObjectId), productId: expect.any(Types.ObjectId) },
        expect.objectContaining({
          $setOnInsert: expect.objectContaining({ addedAt: expect.any(Date) }),
          $set: { productName: 'Kurta', priceAtAdd: 1299 },
        }),
        { new: true, upsert: true }
      );
    });
  });

  describe('findAllFor (populated products)', () => {
    it('maps populated docs to plain product objects, dropping deleted products', async () => {
      const toObject = jest.fn().mockReturnValue({ _id: pid, name: 'Kurta' });
      const entries = [
        { productId: { toObject } },
        { productId: null }, // product deleted since
      ];
      modelMock.find.mockReturnValue(chainable(entries));

      const result = await service.findAllFor(uid);

      expect(result).toEqual([{ _id: pid, name: 'Kurta' }]);
      expect(modelMock.find).toHaveBeenCalledWith({ userId: expect.any(Types.ObjectId) });
    });
  });

  describe('remove', () => {
    it('removes the entry when found', async () => {
      modelMock.findOneAndDelete.mockReturnValue(chainable({ _id: 'w1' }));
      await expect(service.remove(uid, pid)).resolves.toBeUndefined();
    });

    it('throws NotFound when entry missing', async () => {
      modelMock.findOneAndDelete.mockReturnValue(chainable(null));
      await expect(service.remove(uid, pid)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clear', () => {
    it('deletes all entries for the user', async () => {
      modelMock.deleteMany.mockResolvedValue({ deletedCount: 3 });
      await service.clear(uid);
      expect(modelMock.deleteMany).toHaveBeenCalledWith({ userId: expect.any(Types.ObjectId) });
    });
  });

  describe('toggle (returns boolean state)', () => {
    it('removes when present and returns false', async () => {
      const existing = { deleteOne: jest.fn().mockResolvedValue(undefined) };
      modelMock.findOne.mockReturnValue(chainable(existing));

      const res = await service.toggle(uid, { productId: pid } as any);

      expect(res).toBe(false);
      expect(existing.deleteOne).toHaveBeenCalled();
      expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('adds when absent and returns true', async () => {
      modelMock.findOne.mockReturnValue(chainable(null));
      modelMock.findOneAndUpdate.mockResolvedValue({ _id: 'w2' });

      const res = await service.toggle(uid, { productId: pid, productName: 'Kurta' } as any);

      expect(res).toBe(true);
      expect(modelMock.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
