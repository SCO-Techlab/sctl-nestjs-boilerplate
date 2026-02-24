import { LanguageInterceptor } from '@interceptors/language.interceptor';
import { LoggerService } from '@modules/logger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SingleErrorValidationPipe } from '@pipes/single-error-validation.pipe';
import { MAGIC_STRINGS } from '@shared/constants';
import { formatOrigin, getCertificates, titleCase } from '@shared/helpers';
import { IAppConfig } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const httpsEnabled: boolean = process.env.HTTPS_ENABLED === MAGIC_STRINGS.TRUE;
  const certificatesPath = process.env.CERTIFICATES_PATH ?? MAGIC_STRINGS.EMPTY_STRING;
  const certificates = httpsEnabled && certificatesPath
    ? getCertificates(certificatesPath, { certName: MAGIC_STRINGS.FULLCHAIN_PEM, keyName: MAGIC_STRINGS.PRIVKEY_PEM })
    : undefined;

  const app = await NestFactory.create(AppModule,
    {
      logger: new LoggerService(),
      httpsOptions: !certificates ? undefined : {
        key: certificates.key,
        cert: certificates.cert
      }
    }
  );

  const loggerService: LoggerService = app.get(LoggerService);
  const configService: ConfigService = app.get(ConfigService);
  const appConfig: IAppConfig = configService.get(MAGIC_STRINGS.APP) as IAppConfig;

  app.setGlobalPrefix(appConfig.prefix ? appConfig.prefix : MAGIC_STRINGS.API);

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
      titleCase(MAGIC_STRINGS.APP)
    ))
    .catch((err) => loggerService.error(err, titleCase(MAGIC_STRINGS.APP)));
}
bootstrap();
