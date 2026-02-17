import { APP_ENV_CONFIG } from '@env-configs/app';
import { IMongodbEnvConfig, MONGODB_ENV_CONFIG } from '@env-configs/mongodb';
import { MongodbModule } from '@modules/mongodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        return [
          configService.get('mongodb') as IMongodbEnvConfig
        ];
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
