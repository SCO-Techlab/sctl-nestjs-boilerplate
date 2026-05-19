import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { DEFAULT_LANG, MAGIC_NUMBERS, TRANSLATES } from "@shared/constants";
import { Observable } from "rxjs";

@Injectable()
export class LanguageInterceptor implements NestInterceptor {

  private readonly acceptLangHeader = `accept-language`;
  private configLangHeader: string = '';

  constructor(langHeader: string = '') {
    this.configLangHeader = langHeader
      ? langHeader.toLowerCase()
      : this.configLangHeader;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<any>();

    const langRaw =
      (request.headers[this.configLangHeader] as string) ||
      (request.query.lang as string) ||
      this.parseAcceptLanguage(request.headers[this.acceptLangHeader]) ||
      DEFAULT_LANG;

    const langShort = langRaw?.split('-')[MAGIC_NUMBERS.N_0].toLowerCase() ?? DEFAULT_LANG;
    const availableLangs: string[] = Object.keys(TRANSLATES) || [];

    request.lang = availableLangs.includes(langShort) ? langShort : DEFAULT_LANG;

    return next.handle();
  }

  private parseAcceptLanguage(header?: string): string | undefined {
    if (!header) {
      return '';
    }

    return header
      .split(',')
      .map(v => v.split(';')[MAGIC_NUMBERS.N_0].trim())
      .shift();
  }
}