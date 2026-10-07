import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../users/user.schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const makeUser = (overrides: Record<string, any> = {}) => {
  const user: any = {
    _id: { toString: () => 'user-id-1' },
    name: 'Test User',
    email: 'test@appareldesk.com',
    phone: null,
    avatarUrl: undefined,
    role: 'user',
    password: 'hashed-password',
    createdAt: new Date('2026-01-01'),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return user;
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const userMock: any = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: `UserModel`, useValue: userMock },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed-jwt-token') } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('creates a user with hashed password and returns accessToken', async () => {
      (userMock.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (userMock.create as jest.Mock).mockImplementation(async (data) => makeUser(data));

      const result = await service.register({
        name: 'Test User',
        email: 'Test@ApparelDesk.com',
        password: 'secret123',
      } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
      expect(userMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@appareldesk.com', role: 'user' })
      );
      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'signed-jwt-token',
          user: expect.objectContaining({ email: 'test@appareldesk.com' }),
        })
      );
      // password must never leak in the response
      expect((result as any).user.password).toBeUndefined();
    });

    it('throws ConflictException when email already exists', async () => {
      (userMock.findOne as jest.Mock).mockResolvedValue(makeUser());

      await expect(
        service.register({ name: 'X', email: 'test@appareldesk.com', password: 'secret123' } as any)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns auth response on valid credentials', async () => {
      (userMock.findOne as jest.Mock).mockReturnValue({ select: () => Promise.resolve(makeUser()) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@appareldesk.com', password: 'secret123' } as any);

      expect(bcrypt.compare).toHaveBeenCalledWith('secret123', 'hashed-password');
      expect(result.accessToken).toBe('signed-jwt-token');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      (userMock.findOne as jest.Mock).mockReturnValue({ select: () => Promise.resolve(null) });

      await expect(service.login({ email: 'no@user.com', password: 'secret123' } as any)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      (userMock.findOne as jest.Mock).mockReturnValue({ select: () => Promise.resolve(makeUser()) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@appareldesk.com', password: 'wrong123' } as any)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('getProfile', () => {
    it('returns public profile without password', async () => {
      (userMock.findById as jest.Mock).mockResolvedValue(makeUser());

      const result = await service.getProfile('user-id-1');

      expect((result as any).email).toBe('test@appareldesk.com');
      expect((result as any).password).toBeUndefined();
    });

    it('throws UnauthorizedException when user missing', async () => {
      (userMock.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile('ghost')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('updates name and phone and returns public user', async () => {
      const user = makeUser();
      (userMock.findById as jest.Mock).mockResolvedValue(user);

      const result = await service.updateProfile('user-id-1', { name: 'New Name', phone: '9999' } as any);

      expect(user.name).toBe('New Name');
      expect(user.phone).toBe('9999');
      expect(user.save).toHaveBeenCalled();
      expect((result as any).name).toBe('New Name');
    });
  });

  describe('changePassword', () => {
    it('hashes and saves new password on success', async () => {
      const user = makeUser();
      (userMock.findById as jest.Mock).mockReturnValue({
        select: () => Promise.resolve(user),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.changePassword('user-id-1', {
        currentPassword: 'secret123',
        newPassword: 'brand-new-9',
      } as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('brand-new-9', 10);
      expect(user.password).toBe('new-hash');
      expect(user.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('rejects wrong current password', async () => {
      (userMock.findById as jest.Mock).mockReturnValue({
        select: () => Promise.resolve(makeUser()),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-id-1', { currentPassword: 'bad', newPassword: 'brand-new-9' } as any)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
