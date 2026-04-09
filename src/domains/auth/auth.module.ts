import { RolesModule } from '@domains/roles';
import { UsersModule } from '@domains/users';
import { JWT_TOKEN_TYPE } from '@modules/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BcryptService, EmailTemplatesService } from '@shared/services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy.service';
import { TokensService } from './tokens';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    UsersModule,
    RolesModule,
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    AuthStrategy,
    TokensService,
    BcryptService,
    EmailTemplatesService
  ],
  exports: [
    AuthService,
    TokensService,
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
