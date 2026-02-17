
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAGIC_STRINGS } from '@shared/constants';
import { FILE_EXTENSION } from '@shared/enums';
import * as path from 'path';

@Injectable()
export class PublicMiddleware implements NestMiddleware {

  private readonly PUBLIC_DIR = path.resolve(`./${MAGIC_STRINGS.PUBLIC}`);
  private readonly allowedExt = Object.values(FILE_EXTENSION).map(ext => `.${ext}`);
  private apiPrefix: string;

  constructor(private configService: ConfigService) {
    this.apiPrefix = configService.get('app')?.prefix 
      ? `/${configService.get('app')?.prefix}`
      : `/${MAGIC_STRINGS.API}`;
  }

  use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url;

    console.log(`[PublicMiddleware] use -> url: ${url}`);
    console.log(`[PublicMiddleware] use -> apiPrefix: ${this.apiPrefix}`);

    if (url.startsWith(this.apiPrefix)) {
      return next(); // API routes continue
    }

    if (url.startsWith(`/${MAGIC_STRINGS.PUBLIC}/`)) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    if (this.allowedExt.some(ext => url.endsWith(ext))) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    // Fallback: serve index.html for SPA routes
    return res.sendFile(path.join(this.PUBLIC_DIR, `index.${FILE_EXTENSION.HTML}`));
  }
}
