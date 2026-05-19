import { JWT_TOKEN_TYPE } from '@core/jwt';
import { RolesModule } from '@domains/roles';
import { SessionsModule } from '@domains/sessions';
import { UsersModule } from '@domains/users';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BcryptService, SendTemplatesService } from '@shared/services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    SessionsModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    AuthStrategy,
    BcryptService,
    SendTemplatesService
  ],
  exports: [
    AuthService,
  ]
};

@Module({ ...MODULE })
export class AuthModule {
  static register(): DynamicModule {
    return {
      module: AuthModule,
      ...MODULE,
      global: true,
    };
  }
}
