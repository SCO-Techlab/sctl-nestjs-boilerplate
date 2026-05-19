import { JWT_TOKEN_TYPE } from '@core/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';


const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
  ],
  controllers: [
    SessionsController
  ],
  providers: [
    SessionsService,
  ],
  exports: [
    SessionsService
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
