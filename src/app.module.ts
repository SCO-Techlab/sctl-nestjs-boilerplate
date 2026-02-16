import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CONFIGURATION_APP } from './configuration/configuration-app';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        CONFIGURATION_APP
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
