import { JWT_TOKEN_TYPE } from '@modules/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaginationService } from '@shared/services';
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
    PermissionsService,
    PaginationService
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
