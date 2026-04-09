import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestjsJwtService } from '@nestjs/jwt';
import { PROVIDER_CONFIG } from '@shared/helpers';
import { IJwtConfig } from './jwt.config';
import { JWT_TOKEN_TYPE } from './jwt.enum';
import { IJwtToken } from './jwt.interface';

@Injectable()
export class JwtService {

  constructor(
    @Inject(PROVIDER_CONFIG) private options: IJwtConfig,
    private nestjsJwtService: NestjsJwtService,
  ) { }

  /* 
    Create a new authenticate user token
     - accessToken: The token used to authenticate the user
     - refreshToken: The token used to refresh and remember the user in the frontend web application
     - tokenType: The type of token, in this case is 'jwt'
  */
  public createToken<T extends object>(payload: T): IJwtToken | undefined {
    try {
      const accessToken: string = this.nestjsJwtService.sign(payload, {
        secret: this.options.secret,
        expiresIn: this.options.signOptions.expiresIn as any,
        issuer: this.options.signOptions.issuer,
        audience: this.options.signOptions.audience,
        algorithm: this.options.algorithm as any,
      });

      const refreshToken: string = this.createRefreshToken(payload) as string;

      return {
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ? refreshToken : undefined,
        tokenType: JWT_TOKEN_TYPE.JWT,
      } as IJwtToken;
    } catch (error) {
      console.error(`[JwtService] createToken -> Error: ${error}`);
      return undefined;
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

  public getJtiFromToken(token: IJwtToken): string {
    if (!token?.accessToken) {
      return '';
    }

    const decodedToken = this.verifyToken(token.accessToken);
    if (!decodedToken?.jti) {
      return '';
    }

    return decodedToken.jti;
  }

  private createRefreshToken<T extends object>(payload: T): string | undefined {
    if (!this.options.refresh || !this.options.refresh.secret) {
      return undefined;
    }

    try {
      const refreshToken: string = this.nestjsJwtService.sign(payload, {
        secret: this.options.refresh?.secret,
        expiresIn: this.options.refresh?.expiresIn as any,
        issuer: this.options.refresh?.issuer ?? this.options.signOptions.issuer,
        audience: this.options.refresh?.audience ?? this.options.signOptions.audience,
        algorithm: this.options.algorithm as any,
      });

      return refreshToken !== undefined
        ? refreshToken
        : undefined;
    } catch (error) {
      console.error(`[JwtService] createRefreshToken -> Error: ${error}`);
      return undefined;
    }
  }
}
