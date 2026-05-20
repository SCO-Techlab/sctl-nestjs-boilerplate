import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
  ],
  controllers: [
    PermissionsController
  ],
  providers: [
    PermissionsRepository
  ],
  exports: [
    PermissionsRepository
  ]
};

@Module({ ...MODULE })
export class PermissionsModule {
  static register(): DynamicModule {
    return {
      module: PermissionsModule,
      ...MODULE,
      global: true
    };
  }
}
