import { Injectable } from '@nestjs/common';
import { MAGIC_NUMBERS, MAGIC_STRINGS } from '@shared/constants';
import { readFileSync } from 'fs';
import * as hbs from 'handlebars';
import * as juice from 'juice';
import { join } from 'path';

@Injectable()
export class EmailerTemplateService {

  private readonly templatesPath = join(process.cwd(), MAGIC_STRINGS.TEMPLATES);
  private readonly stylesPath = join(process.cwd(), MAGIC_STRINGS.TEMPLATES, MAGIC_STRINGS.STYLES);
  private readonly defaultCssFilename = `${MAGIC_STRINGS.STYLES}${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.CSS}`;

  render(template: string, data: any, styles?: string): string {
    const html = this.compileTemplate(template, data);
    const css = this.loadCss(styles && styles.length > MAGIC_NUMBERS.N_0 ? styles : this.defaultCssFilename);

    return juice.inlineContent(html, css);
  }

  private compileTemplate(template: string, data: any): string {
    const templatePath = join(this.templatesPath, `${template}${MAGIC_STRINGS.DOT}${MAGIC_STRINGS.HBS}`);
    const source = readFileSync(templatePath, MAGIC_STRINGS.UTF8 as BufferEncoding);
    const compiled = hbs.compile(source);

    return compiled(data);
  }

  private loadCss(filename: string): string {
    const cssPath = join(this.stylesPath, filename);
    return readFileSync(cssPath, MAGIC_STRINGS.UTF8 as BufferEncoding);
  }
}