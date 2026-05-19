import { JWT_TOKEN_TYPE } from '@core/jwt';
import { PermissionsModule } from '@domains/permissions';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
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
    RolesService
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
