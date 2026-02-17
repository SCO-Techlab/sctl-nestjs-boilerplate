
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FILE_EXTENSION } from '@shared/enums';
import * as path from 'path';

@Injectable()
export class PublicMiddleware implements NestMiddleware {

  private readonly API_PREFIX = '/api/v';
  private readonly PUBLIC_DIR = path.resolve('./public');
  private readonly allowedExt = Object.values(FILE_EXTENSION).map(ext => `.${ext}`);

  use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url;

    if (url.startsWith(this.API_PREFIX)) {
      return next(); // API routes continue
    }

    if (url.startsWith('/public/')) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    if (this.allowedExt.some(ext => url.endsWith(ext))) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    // Fallback: serve index.html for SPA routes
    return res.sendFile(path.join(this.PUBLIC_DIR, `index.${FILE_EXTENSION.HTML}`));
  }
}
