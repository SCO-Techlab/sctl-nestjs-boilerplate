import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_ENV_CONFIG } from './env-configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        APP_ENV_CONFIG
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
