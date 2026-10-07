import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.schema';

const chainable = (resolveValue: any) => {
  const chain: any = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolveValue),
  };
  return chain;
};

describe('ProductsService', () => {
  let service: ProductsService;

  const modelMock: any = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
    findOne: jest.fn(),
    updateOne: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    modelMock.countDocuments.mockResolvedValue(0);

    const moduleRef = await Test.createTestingModule({
      providers: [ProductsService, { provide: getModelToken(Product.name), useValue: modelMock }],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findStorefront (filters build)', () => {
    beforeEach(() => {
      modelMock.find.mockReturnValue(chainable([]));
    });

    it('applies search, category and price filters, published only', async () => {
      await service.findStorefront({
        search: 'kurta',
        category: 'readymade',
        minPrice: 500,
        maxPrice: 2000,
        page: '2',
        limit: '12',
      } as any);

      const filter = modelMock.find.mock.calls[0][0];
      expect(filter.isPublished).toBe(true);
      expect(filter.$or).toBeDefined(); // text search on name/description/category
      expect(filter.category).toBe('readymade');
      expect(filter.price.$gte).toBe(500);
      expect(filter.price.$lte).toBe(2000);
    });

    it('skips & limits according to page/limit (page 2 x limit 12 → skip 12)', async () => {
      modelMock.countDocuments.mockResolvedValue(50);

      const res = await service.findStorefront({ page: 2, limit: 12 } as any);

      const chain = modelMock.find.mock.results[0].value;
      expect(chain.skip).toHaveBeenCalledWith(12);
      expect(chain.limit).toHaveBeenCalledWith(12);
      expect(res).toEqual({ items: [], total: 50, page: 2, limit: 12, pages: 5 });
    });

    it('defaults to page 1, limit 20, no filters', async () => {
      await service.findStorefront({} as any);

      const filter = modelMock.find.mock.calls[0][0];
      expect(filter).toEqual({ isPublished: true });
      const chain = modelMock.find.mock.results[0].value;
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(20);
    });

    it('ignores category "all"', async () => {
      await service.findStorefront({ category: 'all' } as any);
      const filter = modelMock.find.mock.calls[0][0];
      expect(filter.category).toBeUndefined();
    });
  });

  describe('findAll (admin)', () => {
    it('includes unpublished products', async () => {
      modelMock.find.mockReturnValue(chainable([]));
      await service.findAll({ includeUnpublished: true } as any);
      expect(modelMock.find.mock.calls[0][0]).toEqual({});
    });
  });

  describe('findOne', () => {
    it('returns the product when found', async () => {
      modelMock.findById.mockReturnValue(chainable({ _id: 'p1', name: 'Kurta' }));
      const res = await service.findOne('p1');
      expect(res.name).toBe('Kurta');
    });

    it('throws NotFoundException for missing product', async () => {
      modelMock.findById.mockReturnValue(chainable(null));
      await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('rejects duplicate SKU with ConflictException', async () => {
      const { ConflictException } = await import('@nestjs/common');
      modelMock.findOne.mockReturnValue(chainable({ _id: 'p-old' }));
      await expect(
        service.create({ name: 'Kurta', price: 100, sku: 'AD-1' } as any)
      ).rejects.toThrow(ConflictException);
    });

    it('creates product when SKU unique/free', async () => {
      modelMock.findOne.mockReturnValue(chainable(null));
      modelMock.create.mockResolvedValue({ _id: 'p1', name: 'Kurta', price: 100 });
      const res = await service.create({ name: 'Kurta', price: 100 } as any);
      expect(res.name).toBe('Kurta');
      expect(modelMock.findOne).not.toHaveBeenCalled(); // no sku → no dup check
    });
  });

  describe('update (ProductsPage regression guard)', () => {
    it('passes the patch body through as-is (no id mangling)', async () => {
      const updated = { _id: 'p1', name: 'Updated', price: 999 };
      modelMock.findByIdAndUpdate.mockReturnValue(chainable(updated));

      const res = await service.update('p1', { name: 'Updated', price: 999 } as any);

      expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith('p1', { name: 'Updated', price: 999 }, { new: true });
      expect(res.price).toBe(999);
    });

    it('throws NotFoundException when product missing', async () => {
      modelMock.findByIdAndUpdate.mockReturnValue(chainable(null));
      await expect(service.update('ghost', { price: 1 } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when nothing deleted', async () => {
      modelMock.findByIdAndDelete.mockReturnValue(chainable(null));
      await expect(service.remove('ghost')).rejects.toThrow(NotFoundException);
    });

    it('resolves when deleted', async () => {
      modelMock.findByIdAndDelete.mockReturnValue(chainable({ _id: 'p1' }));
      await expect(service.remove('p1')).resolves.toBeUndefined();
    });
  });

  describe('stock helpers', () => {
    it('decrementStock applies negative $inc', async () => {
      await service.decrementStock('p1', 3);
      expect(modelMock.updateOne).toHaveBeenCalledWith({ _id: 'p1' }, { $inc: { stockQuantity: -3 } });
    });

    it('incrementStock applies positive $inc', async () => {
      await service.incrementStock('p1', 3);
      expect(modelMock.updateOne).toHaveBeenCalledWith({ _id: 'p1' }, { $inc: { stockQuantity: 3 } });
    });
  });
});
