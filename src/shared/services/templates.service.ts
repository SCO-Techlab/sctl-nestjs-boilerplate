import { EmailerService } from "@core/emailer";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TEMPLATES, TRANSLATES } from "@shared/constants";
import { getFrontendUrl } from "@shared/helpers";
import { IUser } from "@shared/interfaces";

@Injectable()
export class TemplatesService {

  constructor(
    private configService: ConfigService,
    private emailerService: EmailerService
  ) { }

  async sendWelcomeEmail(user: IUser, lang: string): Promise<boolean> {
    return await this.emailerService.sendTemplate({
      template: TEMPLATES.WELCOME,
      context: {
        welcome: {
          params: {
            name: user.userName ?? user.personalName ?? user.email ?? '',
            link: getFrontendUrl(
              this.configService.get('app').httpsEnabled,
              this.configService.get('app').host,
              this.configService.get('app').production ? this.configService.get('app').port : MAGIC_NUMBERS.N_4200,
              `auth/confirm-email/${user.email}`
            )
          },
          literals: {
            welcomeText: TRANSLATES[lang].welcome.welcomeText,
            message: TRANSLATES[lang].welcome.message,
            linkText: TRANSLATES[lang].welcome.linkText
          }
        },
        footer: {
          params: {
            year: new Date().getFullYear(),
            appName: this.configService.get('app').appName
          }
        }
      },
      receivers: [user.email],
      subject: TRANSLATES[lang].welcome.subject
    });
  }

  async sendForgotPasswordEmail(user: IUser, lang: string): Promise<boolean> {
    return await this.emailerService.sendTemplate({
      template: TEMPLATES.FORGOT_PASSWORD,
      context: {
        forgotPassword: {
          params: {
            name: user.userName ?? user.personalName ?? user.email ?? '',
            link: getFrontendUrl(
              this.configService.get('app').httpsEnabled,
              this.configService.get('app').host,
              this.configService.get('app').production ? this.configService.get('app').port : MAGIC_NUMBERS.N_4200,
              `auth/reset-password/${user.pwdRecoveryToken}`
            ),
            expiration: this.configService.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30
          },
          literals: {
            welcomeText: TRANSLATES[lang].forgotPassword.welcomeText,
            message: TRANSLATES[lang].forgotPassword.message,
            message2: TRANSLATES[lang].forgotPassword.message2,
            message3: TRANSLATES[lang].forgotPassword.message3,
            linkText: TRANSLATES[lang].forgotPassword.linkText
          }
        },
        footer: {
          params: {
            year: new Date().getFullYear(),
            appName: this.configService.get('app').appName
          }
        }
      },
      receivers: [user.email],
      subject: TRANSLATES[lang].forgotPassword.subject
    });
  }
}
