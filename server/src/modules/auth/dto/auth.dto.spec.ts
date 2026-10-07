import 'reflect-metadata';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { UpdateProductDto } from '../../products/dto/product.dto';
import { UpdateOrderDto } from '../../orders/dto/order.dto';

async function validateDto(dtoClass: any, body: Record<string, any>): Promise<string[]> {
  const instance = plainToInstance(dtoClass, body) as object;
  const errors: ValidationError[] = await validate(instance as any, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((e) => Object.values(e.constraints ?? {})).flat();
}

describe('DTO validation (API edge behaviour)', () => {
  describe('RegisterDto', () => {
    it('accepts valid registration', async () => {
      const errors = await validateDto(RegisterDto, {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'secret123',
        phone: '9876543210',
      });
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid email', async () => {
      const errors = await validateDto(RegisterDto, { name: 'R', email: 'not-an-email', password: 'secret123' });
      expect(errors.join(' ')).toMatch(/email/i);
    });

    it('rejects short passwords (<6 chars)', async () => {
      const errors = await validateDto(RegisterDto, { name: 'Rahul', email: 'r@e.com', password: 'abc' });
      expect(errors.join(' ')).toMatch(/6 characters/i);
    });

    it('rejects unknown/extra fields (forbidNonWhitelisted)', async () => {
      const errors = await validateDto(RegisterDto, {
        name: 'Rahul',
        email: 'r@e.com',
        password: 'secret123',
        role: 'admin', // privilege escalation attempt must fail
      });
      expect(errors.join(' ')).toMatch(/role/);
    });
  });

  describe('LoginDto', () => {
    it('accepts valid login', async () => {
      const errors = await validateDto(LoginDto, { email: 'a@b.com', password: 'secret123' });
      expect(errors).toHaveLength(0);
    });

    it('rejects missing password', async () => {
      const errors = await validateDto(LoginDto, { email: 'a@b.com' });
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors.join(' ')).toMatch(/password/i);
    });
  });

  describe('ChangePasswordDto', () => {
    it('requires both current and new password', async () => {
      const errors = await validateDto(ChangePasswordDto, { currentPassword: 'abc123' });
      expect(errors.join(' ')).toMatch(/newPassword/i);
    });
  });

  describe('UpdateProductDto (ProductsPage regression guard)', () => {
    it('rejects `id` in the PATCH body — forbidNonWhitelisted 400 regression', async () => {
      const errors = await validateDto(UpdateProductDto, {
        id: '507f1f77bcf86cd799439011',
        price: 1499,
      });
      expect(errors.join(' ')).toMatch(/id/);
    });

    it('accepts a clean patch without id', async () => {
      const errors = await validateDto(UpdateProductDto, { price: 1499, stockQuantity: 25 });
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateOrderDto', () => {
    it('accepts valid order status transitions', async () => {
      const errors = await validateDto(UpdateOrderDto, { status: 'shipped' });
      expect(errors).toHaveLength(0);
    });

    it('rejects invalid status values', async () => {
      const errors = await validateDto(UpdateOrderDto, { status: 'teleported' });
      expect(errors.join(' ')).toMatch(/status/i);
    });
  });
});
