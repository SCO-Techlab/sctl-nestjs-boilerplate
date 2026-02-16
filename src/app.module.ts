import { MongodbModule } from '@modules/mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAGIC_STRINGS } from '@shared/constants';
import { APP_ENV_CONFIG, MONGODB_ENV_CONFIG } from './env-configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        APP_ENV_CONFIG,
        MONGODB_ENV_CONFIG
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    MongodbModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return [{
          name: MAGIC_STRINGS.DEFAULT,
          host: configService.get('mongodb.host'),
          port: configService.get('mongodb.port'),
          database: configService.get('mongodb.database'),
          user: configService.get('mongodb.user'),
          pass: configService.get('mongodb.password'),
          authSource: configService.get('mongodb.authSource'),
          avoidConnection: configService.get('mongodb.avoidConnection'),
        }];
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
