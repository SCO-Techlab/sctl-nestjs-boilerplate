import { IRequiredPermission } from '@domains/permissions';
import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: IRequiredPermission[]) => SetMetadata('permissions', permissions);