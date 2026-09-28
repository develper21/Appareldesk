import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthedRequest, JwtPayload } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayload => {
  const req = ctx.switchToHttp().getRequest<AuthedRequest>();
  return req.user as JwtPayload;
});
