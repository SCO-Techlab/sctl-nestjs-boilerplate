import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IAppEnvConfig } from './env-configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig: IAppEnvConfig = app.get(ConfigService).get('app') as IAppEnvConfig;

  await app.listen(appConfig.PORT)
    .then(() => console.log(`Server is running on ${appConfig.HOST}:${appConfig.PORT}`))
    .catch((err) => console.error(err));
}
bootstrap();
