import { MAGIC_NUMBERS } from '@core/shared/constants';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IPermission, IRequiredPermission, IRole, IUser } from '@shared/interfaces';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions: IRequiredPermission[] = this.reflector.get<IRequiredPermission[]>('permissions', context.getHandler()) || [];
    if (!requiredPermissions || requiredPermissions.length === MAGIC_NUMBERS.N_0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: IUser = request.user;

    const userPermissions: IPermission[] = ((user.role as IRole).permissions || []) as IPermission[];
    if (!userPermissions || userPermissions.length === MAGIC_NUMBERS.N_0) {
      throw new ForbiddenException('User has no permissions');
    }

    const userHasPermissions = userPermissions.some((permission: IPermission) =>
      requiredPermissions.some((requiredPermission: IRequiredPermission) => permission.name === requiredPermission.name && permission.type === requiredPermission.type));
    if (!userHasPermissions) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}