import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { RolesModule } from '@domains/roles';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MenuFrontController } from './menu-front.controller';
import { MenuFrontRepository } from './menu-front.repository';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    RolesModule,
  ],
  controllers: [
    MenuFrontController
  ],
  providers: [
    MenuFrontRepository,
  ],
  exports: [
    MenuFrontRepository,
  ]
};

@Module({ ...MODULE })
export class MenuFrontModule {
  static register(): DynamicModule {
    return {
      module: MenuFrontModule,
      ...MODULE,
      global: true
    };
  }
}
