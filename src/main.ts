import { LoggerService } from '@modules/logger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { formatOrigin, getCertificates } from '@shared/helpers';
import { IAppConfig } from './app.config';
import { AppModule } from './app.module';
import { LanguageInterceptor } from './interceptors';
import { SingleErrorValidationPipe } from './pipes';

async function bootstrap() {
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  const certificatesPath = process.env.CERTIFICATES_PATH ?? '';
  const certificates = httpsEnabled && certificatesPath
    ? getCertificates(certificatesPath, { certName: 'fullchain.pem', keyName: 'privkey.pem' })
    : undefined;

  const app = await NestFactory.create(AppModule,
    {
      logger: new LoggerService(),
      httpsOptions: !certificates
        ? undefined
        : { key: certificates.key, cert: certificates.cert }
    }
  );

  const loggerService: LoggerService = app.get(LoggerService);
  const configService: ConfigService = app.get(ConfigService);
  const appConfig: IAppConfig = configService.get('app') as IAppConfig;

  app.setGlobalPrefix(appConfig.prefix ? appConfig.prefix : 'api');

  app.useGlobalPipes(new SingleErrorValidationPipe());

  app.useGlobalInterceptors(new LanguageInterceptor(appConfig.langHeader));

  app.enableCors({
    origin: formatOrigin(appConfig.origin),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(appConfig.port)
    .then(() => loggerService.log(
      `Server is running on ${httpsEnabled ? 'https' : 'http'}://${appConfig.host}:${appConfig.port}`,
      'App'
    ))
    .catch((err) => loggerService.error(err, 'App'));
}
bootstrap();
