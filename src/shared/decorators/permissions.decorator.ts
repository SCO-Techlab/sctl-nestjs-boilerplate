import { IRequiredPermission } from '@domains/permissions';
import { SetMetadata } from '@nestjs/common';
import { MAGIC_STRINGS } from '@shared/constants';

export const Permissions = (...permissions: IRequiredPermission[]) => SetMetadata(MAGIC_STRINGS.PERMISSIONS, permissions);