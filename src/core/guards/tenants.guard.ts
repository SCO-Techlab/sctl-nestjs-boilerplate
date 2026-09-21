import { JwtService } from "@core/jwt";
import { MAGIC_NUMBERS } from "@core/shared";
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { formatObjectId } from "@shared/helpers";
import { IAuthPayload, ITenant } from "@shared/interfaces";

@Injectable()
export class TenantsGuard implements CanActivate {

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const selectTenantHeader = this.configService.get('app.multitenancyHeader') ?? '';
    if (!selectTenantHeader) {
      throw new BadRequestException('Multitenancy header not found');
    }

    const selectedTenantId = request.headers[selectTenantHeader];
    if (!selectedTenantId) {
      throw new ForbiddenException('Selected tenant not found');
    }
    request.selectedTenantId = selectedTenantId;

    const allowedTenants = this.getTenantsFromToken(request) ?? [];
    if (!allowedTenants || allowedTenants.length === MAGIC_NUMBERS.N_0) {
      throw new ForbiddenException('You do not belong to any tenant');
    }
    request.tenants = allowedTenants;

    const hasAccess = allowedTenants.some((tenant: ITenant) => formatObjectId(tenant?._id ?? '') === formatObjectId(selectedTenantId));
    if (!hasAccess) {
      throw new ForbiddenException('You do not belong to this tenant');
    }

    return true;
  }

  private getTenantsFromToken(request): any[] {
    const authHeader = request.headers.authorization ?? request.headers.Authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : undefined;

    if (!token) {
      return [];
    }

    const payload: IAuthPayload = this.jwtService.verifyToken(token) as IAuthPayload;
    return payload.tenants ?? [];
  }
}