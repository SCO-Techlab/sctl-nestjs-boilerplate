import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IAppConfig } from './app.config';
import { AppLogger } from './app.logger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: new AppLogger()
    }
  );

  const appConfig: IAppConfig = app.get(ConfigService).get('app') as IAppConfig;
  await app.listen(appConfig.port)
    .then(() => console.log(`Server is running on ${appConfig.host}:${appConfig.port}`))
    .catch((err) => console.error(err));
}
bootstrap();
