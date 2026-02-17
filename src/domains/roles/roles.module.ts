import { PermissionsModule } from '@domains/permissions';
import { JWT_TOKEN_TYPE } from '@modules/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaginationService } from '@shared/services';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    PermissionsModule,
  ],
  controllers: [
    RolesController
  ],
  providers: [
    RolesService,
    PaginationService
  ],
  exports: [
    RolesService
  ]
};

@Module({ ...MODULE })
export class RolesModule {
  static register(): DynamicModule {
    return {
      module: RolesModule,
      ...MODULE,
      global: true
    };
  }
}
