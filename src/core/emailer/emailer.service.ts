import { Inject, Injectable } from '@nestjs/common';
import { MAGIC_NUMBERS } from '@shared/constants';
import { PROVIDER_CONFIG } from '@shared/helpers';
import { createTransport, Transporter } from 'nodemailer';
import { take, timer } from 'rxjs';
import { EmailerTemplateService } from './emailer-templates.service';
import { IEmailerConfig } from './emailer.config';
import { IEmailerMessage, IEmailerTemplate } from './emailer.interface';

@Injectable()
export class EmailerService {

  private transporters: Map<string, Transporter> = new Map<string, Transporter>();

  constructor(
    @Inject(PROVIDER_CONFIG) private options: IEmailerConfig[],
    private emailerTemplateService: EmailerTemplateService
  ) { }

  async onModuleInit(): Promise<void> {
    if (!this.validateOptions(this.options)) {
      return;
    }

    timer(MAGIC_NUMBERS.N_10)
      .pipe(take(MAGIC_NUMBERS.N_1))
      .subscribe(async () => {
        for (const config of this.options) {
          await this.createTransporter(config);
        }
      });
  }

  public async send(message: IEmailerMessage, name: string = 'default'): Promise<boolean> {
    if (!this.transporters.has(name)) {
      return false;
    }

    const options: IEmailerConfig = this.options?.find(config => config.name === name) as IEmailerConfig;
    if (!options) {
      return false;
    }

    const mailOptions = {
      from: options.sender,
      to: message.receivers,
      subject: message.subject,
      text: message.text,
      html: message.html ?? `<p>${message.text}</p>`,
      attachments: message.attachments ?? [],
    };

    try {
      const transporter = this.transporters.get(name);
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error(`[EmailerService] sendMail (${name}) -> Error: ${err}`);
      return false;
    }
  }

  public async sendTemplate(template: IEmailerTemplate, name: string = 'default'): Promise<boolean> {
    if (!this.transporters.has(name)) {
      return false;
    }

    const options: IEmailerConfig = this.options?.find(config => config.name === name) as IEmailerConfig;
    if (!options) {
      return false;
    }

    try {
      const html = this.emailerTemplateService.render(template.template, template.context, template.options);
      const mailOptions: IEmailerMessage = {
        text: html,
        html: html,
        receivers: template?.receivers,
        subject: template?.subject,
        attachments: template?.attachments ?? [],
      };
      return await this.send(mailOptions, name);
    } catch (err) {
      console.error(`[EmailerService] sendTemplate (${name}) -> Error: ${err}`);
      return false;
    }
  }

  private closeTransporter(name: string = 'default'): boolean {
    if (!this.transporters.has(name)) {
      return false;
    }

    try {
      this.transporters.get(name)?.close?.();
      this.transporters.delete(name);
      return true;
    } catch (err) {
      console.error(`[EmailerService] closeTransporter (${name}) -> Error: ${err}`);
      return false;
    }
  }

  private async createTransporter(config: IEmailerConfig): Promise<boolean> {
    this.closeTransporter(config?.name);

    try {
      const transporter: Transporter = createTransport({
        service: config.service ?? '',
        auth: {
          user: config.authUser,
          pass: config.authPassword,
        },
        tls: {
          rejectUnauthorized: config.rejectUnauthorized !== undefined
            ? config.rejectUnauthorized
            : false,
        },
        secure: config.secure !== undefined
          ? config.secure
          : false
      });

      this.transporters.set(config.name, transporter);
      console.log(`[EmailerService] createTransporter (${config.name}) -> Transporter successfully created`);
      return true;
    } catch (err) {
      console.error(`[EmailerService] createTransporter (${config.name}) -> Error: ${err}`);
      return false;
    }
  }

  private validateOptions(options: IEmailerConfig[]): boolean {
    if (!options || options.length === MAGIC_NUMBERS.N_0) {
      console.error('[EmailerService] Invalid configuration: no configuration parameters provided');
      return false;
    }

    const usedNames = new Set<string>();
    for (const config of options) {
      if (!config.name) {
        console.error('[EmailerService] Invalid configuration: missing "name" parameter');
        return false;
      }

      if (usedNames.has(config.name)) {
        console.error(`[EmailerService] Invalid configuration: duplicate configuration name '${config.name}'`);
        return false;
      }
      usedNames.add(config.name);

      if (!config.sender) {
        console.error(`[EmailerService] Invalid configuration: missing "sender" parameter for '${config.name}'`);
        return false;
      }

      if (!config.authUser) {
        console.error(`[EmailerService] Invalid configuration: missing "authUser" parameter for '${config.name}'`);
        return false;
      }

      if (!config.authPassword) {
        console.error(`[EmailerService] Invalid configuration: missing "authPassword" parameter for '${config.name}'`);
        return false;
      }
    }

    return true;
  }
}
