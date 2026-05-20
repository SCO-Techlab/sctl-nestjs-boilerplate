import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '@shared/types';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: RequestUser = { ...request.user };
    return user ?? undefined;
  },
);