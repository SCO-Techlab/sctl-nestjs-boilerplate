import { MAGIC_NUMBERS } from "@core/shared";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class LanguageInterceptor implements NestInterceptor {

  private readonly acceptLangHeader = `accept-language`;
  private configLangHeader: string = '';
  private defaultLang: string;
  private translates: any;

  constructor(defaultLang: string, translates: any, langHeader: string = '') {
    this.defaultLang = defaultLang;
    this.translates = translates;
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
      this.defaultLang;

    const langShort = langRaw?.split('-')[MAGIC_NUMBERS.N_0].toLowerCase() ?? this.defaultLang;
    const availableLangs: string[] = Object.keys(this.translates) || [];

    request.lang = availableLangs.includes(langShort) ? langShort : this.defaultLang;

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