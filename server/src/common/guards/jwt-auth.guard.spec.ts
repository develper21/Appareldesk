import { UnauthorizedException, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

/* JwtAuthGuard token extraction + verification test karta hai (cookie fallback included). */
describe('JwtAuthGuard', () => {
  const makeContext = (req: Record<string, any>): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as unknown as ExecutionContext;

  const makeGuard = (verifyImpl: (t: string) => any) => {
    const guard = new JwtAuthGuard({ verifyAsync: verifyImpl } as any);
    return guard;
  };

  it('accepts a valid bearer token and attaches payload to request', async () => {
    const req: any = { headers: { authorization: 'Bearer good-token' } };
    const guard = makeGuard(async (t) => ({ sub: 'u1', email: 'a@b.c', role: 'user', token: t }));

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect(req.user).toEqual({ sub: 'u1', email: 'a@b.c', role: 'user', token: 'good-token' });
  });

  it('falls back to access_token cookie when header missing', async () => {
    const req: any = { headers: {}, cookies: { access_token: 'cookie-token' } };
    const guard = makeGuard(async () => ({ sub: 'u1', role: 'admin' }));

    await expect(guard.canActivate(makeContext(req))).resolves.toBe(true);
    expect(req.user?.sub).toBe('u1');
  });

  it('rejects requests with no token at all', async () => {
    const req: any = { headers: {} };
    const guard = makeGuard(async () => ({}));

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects invalid/expired tokens', async () => {
    const req: any = { headers: { authorization: 'Bearer bad-token' } };
    const guard = makeGuard(async () => {
      throw new Error('jwt expired');
    });

    await expect(guard.canActivate(makeContext(req))).rejects.toThrow(UnauthorizedException);
  });
});

describe('RolesGuard', () => {
  const makeContext = (role?: string): ExecutionContext => {
    const reflector = { getAllAndOverride: () => ['admin'] } as unknown as Reflector;
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { sub: 'u1', role } : undefined }),
      }),
      getHandler: () => () => {},
      getClass: () => class {},
    } as unknown as ExecutionContext;
  };

  const guardWith = (required: Array<'admin' | 'user'> | undefined) => {
    const reflector = {
      getAllAndOverride: () => required,
    } as unknown as Reflector;
    return new RolesGuard(reflector);
  };

  it('allows access when no roles are required on the route', () => {
    expect(guardWith(undefined).canActivate(makeContext('user'))).toBe(true);
    expect(guardWith([]).canActivate(makeContext(undefined))).toBe(true);
  });

  it('allows admin into admin-only routes', () => {
    expect(guardWith(['admin']).canActivate(makeContext('admin'))).toBe(true);
  });

  it('blocks customer (user role) from admin-only routes', () => {
    expect(() => guardWith(['admin']).canActivate(makeContext('user'))).toThrow(ForbiddenException);
  });

  it('blocks unauthenticated requests from role-protected routes', () => {
    expect(() => guardWith(['admin']).canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
