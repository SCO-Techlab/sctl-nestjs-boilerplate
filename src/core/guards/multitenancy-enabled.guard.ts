import { CanActivate, ConflictException, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";

@Injectable()
export class MultitenancyEnabledGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const multitenancyEnabled: boolean = this.configService.get('app.multitenancyEnabled') ?? false;
    if (!multitenancyEnabled) {
      throw new ConflictException('Multitenancy is not enabled');
    }

    return true;
  }
}