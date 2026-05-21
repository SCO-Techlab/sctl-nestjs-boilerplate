import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { RolesModule } from '@domains/roles';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '@shared/module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    SharedModule,
    RolesModule,
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersRepository,
    UsersService,
  ],
  exports: [
    UsersRepository,
    UsersService,
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
