import { EmailerService } from "@core/emailer";
import { IUser } from "@domains/users";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MAGIC_NUMBERS, TEMPLATES, TRANSLATES } from "@shared/constants";
import { getFrontendUrl } from "@shared/helpers";

@Injectable()
export class EmailTemplatesService {

  constructor(
    private emailerService: EmailerService,
    private configSerive: ConfigService
  ) { }

  public async sendWelcomeEmail(user: IUser, lang: string): Promise<boolean> {
    return await this.emailerService.sendTemplate({
      template: TEMPLATES.WELCOME,
      context: {
        welcome: {
          params: {
            name: user.userName ?? user.personalName ?? user.email ?? '',
            link: getFrontendUrl(
              this.configSerive.get('app').httpsEnabled,
              this.configSerive.get('app').host,
              this.configSerive.get('app').production ? this.configSerive.get('app').port : MAGIC_NUMBERS.N_4200,
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
            appName: this.configSerive.get('app').appName
          }
        }
      },
      receivers: [user.email],
      subject: TRANSLATES[lang].welcome.subject
    });
  }

  public async sendForgotPasswordEmail(user: IUser, lang: string): Promise<boolean> {
    return await this.emailerService.sendTemplate({
      template: TEMPLATES.FORGOT_PASSWORD,
      context: {
        forgotPassword: {
          params: {
            name: user.userName ?? user.personalName ?? user.email ?? '',
            link: getFrontendUrl(
              this.configSerive.get('app').httpsEnabled,
              this.configSerive.get('app').host,
              this.configSerive.get('app').production ? this.configSerive.get('app').port : MAGIC_NUMBERS.N_4200,
              `auth/reset-password/${user.pwdRecoveryToken}`
            ),
            expiration: this.configSerive.get('app').pwdRecoveryExpiration ?? MAGIC_NUMBERS.N_30
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
            appName: this.configSerive.get('app').appName
          }
        }
      },
      receivers: [user.email],
      subject: TRANSLATES[lang].forgotPassword.subject
    });
  }
}
