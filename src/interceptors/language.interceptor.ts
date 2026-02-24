import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { DEFAULT_LANG, MAGIC_NUMBERS, MAGIC_STRINGS, TRANSLATES } from "@shared/constants";
import { Observable } from "rxjs";

@Injectable()
export class LanguageInterceptor implements NestInterceptor {

  private readonly acceptLangHeader = `${MAGIC_STRINGS.ACCEPT}${MAGIC_STRINGS.DASH}${MAGIC_STRINGS.LANGUAGE}`;
  private configLangHeader: string = MAGIC_STRINGS.EMPTY_STRING;

  constructor(langHeader: string = MAGIC_STRINGS.EMPTY_STRING) {
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

    const langShort = langRaw?.split(MAGIC_STRINGS.DASH)[MAGIC_NUMBERS.N_0].toLowerCase() ?? DEFAULT_LANG;
    const availableLangs: string[] = Object.keys(TRANSLATES) || [];

    request.lang = availableLangs.includes(langShort) ? langShort : DEFAULT_LANG;

    return next.handle();
  }

  private parseAcceptLanguage(header?: string): string | undefined {
    if (!header) {
      return MAGIC_STRINGS.EMPTY_STRING;
    }

    return header
      .split(MAGIC_STRINGS.COMMA)
      .map(v => v.split(MAGIC_STRINGS.SEMICOLON)[MAGIC_NUMBERS.N_0].trim())
      .shift();
  }
}