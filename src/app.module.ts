import { PublicMiddleware } from '@core/middlewares';
import { CoreModule } from '@core/module';
import { DomainsModule } from '@domains/module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_ENV, EMAILER_ENV, JWT_ENV, MONGODB_ENV } from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        APP_ENV,
        MONGODB_ENV,
        JWT_ENV,
        EMAILER_ENV,
      ],
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    CoreModule,
    DomainsModule,
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(PublicMiddleware).forRoutes('*');
  }
}
