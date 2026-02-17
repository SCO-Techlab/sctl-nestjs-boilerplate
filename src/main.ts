import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppLogger } from './app.logger';
import { AppModule } from './app.module';
import { IAppEnvConfig } from './env-configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: new AppLogger()
    }
  );

  const appConfig: IAppEnvConfig = app.get(ConfigService).get('app') as IAppEnvConfig;
  await app.listen(appConfig.port)
    .then(() => console.log(`Server is running on ${appConfig.host}:${appConfig.port}`))
    .catch((err) => console.error(err));
}
bootstrap();
