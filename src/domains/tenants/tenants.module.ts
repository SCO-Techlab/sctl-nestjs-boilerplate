import { JWT_TOKEN_TYPE } from '@core/jwt';
import { UsersModule } from '@domains/users';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    UsersModule,
  ],
  controllers: [
    TenantsController
  ],
  providers: [
    TenantsRepository,
    TenantsService
  ],
  exports: [
    TenantsRepository,
    TenantsService
  ]
};

@Module({ ...MODULE })
export class TenantsModule {
  static register(): DynamicModule {
    return {
      module: TenantsModule,
      ...MODULE,
      global: true
    };
  }
}
