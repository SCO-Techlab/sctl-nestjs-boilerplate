import { LoggerService } from '@modules/logger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MAGIC_STRINGS } from '@shared/constants';
import { formatOrigin } from '@shared/helpers';
import { SingleErrorValidationPipe } from '@shared/pipes';
import { IAppConfig } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: new LoggerService()
    }
  );

  const configService: ConfigService = app.get(ConfigService);
  const appConfig: IAppConfig = configService.get('app') as IAppConfig;

  app.setGlobalPrefix(appConfig.prefix ? appConfig.prefix : MAGIC_STRINGS.API);

  app.useGlobalPipes(new SingleErrorValidationPipe());

  app.enableCors({
    origin: formatOrigin(appConfig.origin),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(appConfig.port)
    .then(() => console.log(`Server is running on ${appConfig.host}:${appConfig.port}`))
    .catch((err) => console.error(err));
}
bootstrap();
