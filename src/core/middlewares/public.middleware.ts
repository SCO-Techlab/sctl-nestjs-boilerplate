
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FILE_EXTENSION } from '@shared/enums';
import * as path from 'path';

@Injectable()
export class PublicMiddleware implements NestMiddleware {

  private readonly PUBLIC_DIR = path.resolve('./public');
  private readonly allowedExt = Object.values(FILE_EXTENSION).map(ext => `.${ext}`);
  private apiPrefix: string;

  constructor(private configService: ConfigService) {
    this.apiPrefix = this.getApiPrefix();
  }

  public use(req: any, res: any, next: () => void) {
    const url = req.originalUrl || req.url;

    if (url.startsWith(this.apiPrefix)) {
      return next();
    }

    if (url.startsWith('/public/')) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    if (this.allowedExt.some(ext => url.endsWith(ext))) {
      return res.sendFile(path.join(this.PUBLIC_DIR, decodeURI(url)));
    }

    return res.sendFile(path.join(this.PUBLIC_DIR, `index.${FILE_EXTENSION.HTML}`));
  }

  private getApiPrefix(): string {
    return this.configService.get('app')?.prefix
      ? `/${this.configService.get('app')?.prefix}`
      : `/api`;
  }
}
