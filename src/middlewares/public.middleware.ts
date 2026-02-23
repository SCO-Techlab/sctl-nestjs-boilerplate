
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_STRINGS } from '@shared/constants';
import { FILE_EXTENSION } from '@shared/enums';
import * as path from 'path';

@Injectable()
export class PublicMiddleware implements NestMiddleware {

  private readonly PUBLIC_DIR = path.resolve(`${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.SLASH}${MAGIC_STRINGS.PUBLIC}`);
  private readonly allowedExt = Object.values(FILE_EXTENSION).map(ext => `${MAGIC_STRINGS.DOT}${ext}`);
  private apiPrefix: string;

  constructor(private configService: ConfigService) {
    this.apiPrefix = configService.get(MAGIC_STRINGS.APP)?.prefix
      ? `${MAGIC_STRINGS.SLASH}${configService.get(MAGIC_STRINGS.APP)?.prefix}`
      : `${MAGIC_STRINGS.SLASH}${MAGIC_STRINGS.API}`;
  }

  use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url;

    if (url.startsWith(this.apiPrefix)) {
      return next();
    }

    if (url.startsWith(`${MAGIC_STRINGS.SLASH}${MAGIC_STRINGS.PUBLIC}${MAGIC_STRINGS.SLASH}`)) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    if (this.allowedExt.some(ext => url.endsWith(ext))) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    return res.sendFile(path.join(this.PUBLIC_DIR, `${MAGIC_STRINGS.INDEX}${MAGIC_STRINGS.DOT}${FILE_EXTENSION.HTML}`));
  }
}
