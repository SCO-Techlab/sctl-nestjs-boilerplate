import { SetMetadata } from '@nestjs/common';
import { IRequiredPermission } from '@shared/interfaces';

export const Permissions = (...permissions: IRequiredPermission[]) => SetMetadata('permissions', permissions);