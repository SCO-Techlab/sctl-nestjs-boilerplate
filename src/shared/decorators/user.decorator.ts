import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestUser } from '@shared/types';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IRequestUser = { ...request.user };
    return user ?? undefined;
  },
);