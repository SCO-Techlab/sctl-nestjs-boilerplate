import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import * as Handlebars from 'handlebars';
import * as juice from 'juice';
import { join } from 'path';
import { IEmailerRenderOptions } from './emailer.interface';

@Injectable()
export class EmailerTemplateService {

  private readonly basePath = join(process.cwd(), 'templates');
  private readonly layoutsPath = join(this.basePath, 'layouts');
  private readonly partialsPath = join(this.basePath, 'partials');
  private readonly stylesPath = join(this.basePath, 'styles');

  private readonly defaultLayout = 'main';
  private readonly defaultCss = 'main.css';

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
    const templatePath = join(this.basePath, `${template}.hbs`);
    const source = readFileSync(templatePath, 'utf8');
    return Handlebars.compile(source)(data);
  }

  private applyLayout(layout: string, data: any): string {
    const layoutPath = join(this.layoutsPath, `${layout}.hbs`);
    const source = readFileSync(layoutPath, 'utf8');
    return Handlebars.compile(source)(data);
  }

  private loadCss(filename: string): string {
    const cssPath = join(this.stylesPath, filename);
    return readFileSync(cssPath, 'utf8');
  }

  private registerPartials(): void {
    const files = readdirSync(this.partialsPath);

    for (const file of files) {
      if (!file.endsWith('.hbs')) {
        continue;
      }

      const partialName = file.replace(`.hbs`, '');
      const content = readFileSync(join(this.partialsPath, file), 'utf8');

      Handlebars.registerPartial(partialName, content);
    }
  }
}