import { JWT_TOKEN_TYPE } from '@core/jwt';
import { RolesModule } from '@domains/roles';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BcryptService, SendTemplatesService } from '@shared/services';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    RolesModule,
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService,
    BcryptService,
    SendTemplatesService
  ],
  exports: [
    UsersService
  ]
};

@Module({ ...MODULE })
export class UsersModule {
  static register(): DynamicModule {
    return {
      module: UsersModule,
      ...MODULE,
      global: true
    };
  }
}
