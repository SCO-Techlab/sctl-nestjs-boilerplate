import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestjsJwtService } from '@nestjs/jwt';
import { PROVIDER_CONFIG } from '@shared/helpers';
import { IJwtConfig } from './jwt.config';
import { JWT_TOKEN_TYPE } from './jwt.enum';
import { IJwtToken } from './jwt.interface';
import { IAuthPayload } from '@domains/auth';

@Injectable()
export class JwtService {

  constructor(
    @Inject(PROVIDER_CONFIG) private options: IJwtConfig,
    private nestjsJwtService: NestjsJwtService,
  ) { }

  public createTokenResponse(accessToken: string, refreshToken?: string): IJwtToken {
    return {
      accessToken,
      refreshToken: refreshToken ?? '',
      tokenType: JWT_TOKEN_TYPE.JWT,
    };
  }

  public createToken<T extends object>(payload: T): string {
    try {
      const accessToken: string = this.nestjsJwtService.sign(payload, {
        secret: this.options.secret,
        expiresIn: this.options.signOptions.expiresIn as any,
        issuer: this.options.signOptions.issuer,
        audience: this.options.signOptions.audience,
        algorithm: this.options.algorithm as any,
      });

      return accessToken ?? '';
    } catch (error) {
      console.error(`[JwtService] createToken -> Error: ${error}`);
      return '';
    }
  }

  public verifyToken<T = any>(accessToken: string): T | undefined {
    try {
      return this.nestjsJwtService.verify<any>(accessToken, {
        secret: this.options.secret,
        issuer: this.options.signOptions.issuer,
        audience: this.options.signOptions.audience as any,
      });
    } catch (error) {
      console.error(`[JwtService] verifyToken -> Error: ${error}`);
      return undefined;
    }
  }

  public createRefreshToken<T extends object>(payload: T): string {
    if (!this.options.refresh?.secret) {
      return '';
    }

    try {
      const refreshToken: string = this.nestjsJwtService.sign(payload, {
        secret: this.options.refresh?.secret,
        expiresIn: this.options.refresh?.expiresIn as any,
        issuer: this.options.refresh?.issuer ?? this.options.signOptions.issuer,
        audience: this.options.refresh?.audience ?? this.options.signOptions.audience,
        algorithm: this.options.algorithm as any,
      });

      return refreshToken ?? '';
    } catch (error) {
      console.error(`[JwtService] createRefreshToken -> Error: ${error}`);
      return '';
    }
  }

  public verifyRefreshToken<T = any>(refreshToken: string): T | undefined {
    try {
      return this.nestjsJwtService.verify<any>(refreshToken, {
        secret: this.options.refresh?.secret,
        issuer: this.options.refresh?.issuer ?? this.options.signOptions.issuer,
        audience: this.options.refresh?.audience ?? this.options.signOptions.audience as any,
      });
    } catch (error) {
      console.error(`[JwtService] verifyRefreshToken -> Error: ${error}`);
      return undefined;
    }
  }

  public getJtiFromToken(token: string, refresh?: boolean): string {
    if (!token) {
      return '';
    }

    const decodedToken: IAuthPayload = refresh
      ? this.verifyRefreshToken<IAuthPayload>(token) as IAuthPayload
      : this.verifyToken<IAuthPayload>(token) as IAuthPayload;

    return decodedToken?.jti ?? '';
  }
}
