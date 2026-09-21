import { JWT_TOKEN_TYPE } from '@core/jwt';
import { TenantsModule } from '@domains/tenants';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ResidencesController } from './residences.controller';
import { ResidencesRepository } from './residences.repository';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
    TenantsModule,
  ],
  controllers: [
    ResidencesController
  ],
  providers: [
    ResidencesRepository
  ],
  exports: [
    ResidencesRepository
  ]
};

@Module({ ...MODULE })
export class ResidencesModule {
  static register(): DynamicModule {
    return {
      module: ResidencesModule,
      ...MODULE,
      global: true
    };
  }
}
