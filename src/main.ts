import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from './shared/configs/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig: IAppConfig = app.get(ConfigService).get('app') as IAppConfig;

  await app.listen(appConfig.PORT)
    .then(() => console.log(`Server is running on ${appConfig.HOST}:${appConfig.PORT}`))
    .catch((err) => console.error(err));
}
bootstrap();
