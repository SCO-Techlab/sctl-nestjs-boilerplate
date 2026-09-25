import { MultitenancyEnabledGuard, TenantsGuard } from '@core/guards';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Tenant } from '@shared/decorators';
import { ITenantImages } from './images.interface';
import { ImagesService } from './images.service';

@Controller(APP_CONTROLLERS.IMAGES)
export class ImagesController {

  constructor(private readonly service: ImagesService) { }

  @Get('tenant/:userId')
  @UseGuards(AuthGuard(), MultitenancyEnabledGuard, TenantsGuard)
  async find(
    @Tenant() tenantId: string,
    @Param('userId') userId: string,
  ): Promise<ITenantImages> {
    return await this.service.getTenantImages(tenantId, userId);
  }
}
