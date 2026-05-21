import { JWT_TOKEN_TYPE } from '@core/shared/enums';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SessionsController } from './sessions.controller';
import { SessionsRepository } from './sessions.repository';
import { SessionsService } from './sessions.service';

const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
  ],
  controllers: [
    SessionsController
  ],
  providers: [
    SessionsRepository,
    SessionsService,
  ],
  exports: [
    SessionsRepository,
    SessionsService,
  ]
};

@Module({ ...MODULE })
export class SessionsModule {
  static register(): DynamicModule {
    return {
      module: SessionsModule,
      ...MODULE,
      global: true,
    };
  }
}
