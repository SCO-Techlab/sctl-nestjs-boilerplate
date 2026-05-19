import { JWT_TOKEN_TYPE } from '@core/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
  ],
  controllers: [
    PermissionsController
  ],
  providers: [
    PermissionsService
  ],
  exports: [
    PermissionsService
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
