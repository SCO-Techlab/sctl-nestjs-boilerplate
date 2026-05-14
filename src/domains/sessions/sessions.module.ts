import { JWT_TOKEN_TYPE } from '@modules/jwt';
import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RefreshSessionsService } from './refresh-sessions';
import { SessionsService } from './sessions.service';


const MODULE = {
  imports: [
    PassportModule.register({ defaultStrategy: JWT_TOKEN_TYPE.JWT }),
  ],
  controllers: [
  ],
  providers: [
    SessionsService,
    RefreshSessionsService,
  ],
  exports: [
    SessionsService,
    RefreshSessionsService
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
