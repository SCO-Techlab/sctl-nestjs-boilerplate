import { CoreModule } from '@core/module';
import { DomainsModule } from '@domains/modules';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_ENV, EMAILER_ENV, JWT_ENV, MONGODB_ENV } from './env';
import { PublicMiddleware } from './middlewares';

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
