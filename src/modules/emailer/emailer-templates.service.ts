import { Injectable } from '@nestjs/common';
import { MAGIC_STRINGS } from '@shared/constants';
import { readFileSync, readdirSync } from 'fs';
import * as Handlebars from 'handlebars';
import * as juice from 'juice';
import { join } from 'path';
import { IEmailerRenderOptions } from './emailer.interface';

@Injectable()
export class EmailerTemplateService {

  private readonly basePath = join(process.cwd(), MAGIC_STRINGS.TEMPLATES);
  private readonly layoutsPath = join(this.basePath, MAGIC_STRINGS.LAYOUTS);
  private readonly partialsPath = join(this.basePath, MAGIC_STRINGS.PARTIALS);
  private readonly stylesPath = join(this.basePath, MAGIC_STRINGS.STYLES);

  private readonly defaultLayout = MAGIC_STRINGS.MAIN;
  private readonly defaultCss = `${MAGIC_STRINGS.MAIN}${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.CSS}`;

  constructor() {
    this.registerPartials();
  }

  public render(template: string, data: any, options?: IEmailerRenderOptions): string {
    const layout = options?.layout ?? this.defaultLayout;
    const cssFile = options?.css ?? this.defaultCss;

    const bodyHtml = this.compileTemplate(template, data);
    const fullHtml = this.applyLayout(layout, { ...data, body: bodyHtml });

    const css = this.loadCss(cssFile);

    return juice.inlineContent(fullHtml, css);
  }

  private compileTemplate(template: string, data: any): string {
    const templatePath = join(this.basePath, `${template}${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.HBS}`);
    const source = readFileSync(templatePath, MAGIC_STRINGS.UTF8 as BufferEncoding);
    return Handlebars.compile(source)(data);
  }

  private applyLayout(layout: string, data: any): string {
    const layoutPath = join(this.layoutsPath, `${layout}${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.HBS}`);
    const source = readFileSync(layoutPath, MAGIC_STRINGS.UTF8 as BufferEncoding);
    return Handlebars.compile(source)(data);
  }

  private loadCss(filename: string): string {
    const cssPath = join(this.stylesPath, filename);
    return readFileSync(cssPath, MAGIC_STRINGS.UTF8 as BufferEncoding);
  }

  private registerPartials(): void {
    const files = readdirSync(this.partialsPath);

    for (const file of files) {
      if (!file.endsWith(MAGIC_STRINGS.DOT + MAGIC_STRINGS.HBS)) {
        continue;
      }

      const partialName = file.replace(`${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.HBS}`, '');
      const content = readFileSync(join(this.partialsPath, file), MAGIC_STRINGS.UTF8 as BufferEncoding);

      Handlebars.registerPartial(partialName, content);
    }
  }
}