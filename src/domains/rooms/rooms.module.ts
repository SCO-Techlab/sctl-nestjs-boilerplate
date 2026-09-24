import { JWT_TOKEN_TYPE } from '@core/jwt';
import { TenantsModule } from '@domains/tenants';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ResidencesModule } from '@domains/residences';
import { RoomsController } from './rooms.controller';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    TenantsModule,
    ResidencesModule,
  ],
  controllers: [
    RoomsController,
  ],
  providers: [
    RoomsRepository,
    RoomsService,
  ],
  exports: [
    RoomsRepository,
    RoomsService,
  ],
};

@Module({ ...MODULE })
export class RoomsModule {
  static register(): DynamicModule {
    return {
      module: RoomsModule,
      ...MODULE,
      global: true,
    };
  }
}
