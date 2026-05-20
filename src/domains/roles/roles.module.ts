import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { PermissionsModule } from '@domains/permissions';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    PermissionsModule,
  ],
  controllers: [
    RolesController
  ],
  providers: [
    RolesRepository
  ],
  exports: [
    RolesRepository
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
