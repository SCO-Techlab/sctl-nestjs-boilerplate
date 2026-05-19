import { formatObjectId } from '@core/mongodb';
import { IUser } from '@domains/users';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user: IUser = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }

    const userId: string = request?.params?._id;
    if (!userId) {
      throw new ForbiddenException();
    }

    if (formatObjectId(userId) !== formatObjectId(user._id as string)) {
      throw new ForbiddenException();
    }

    return true;
  }
}