import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { RolesModule } from '@domains/roles';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MenuFrontController } from './menu-front.controller';
import { MenuFrontService } from './menu-front.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    RolesModule,
  ],
  controllers: [
    MenuFrontController
  ],
  providers: [
    MenuFrontService
  ],
  exports: [
    MenuFrontService
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
