import { MultitenancyEnabledGuard } from '@core/guards';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/mongodb';
import { IPaginationResponse } from '@core/pagination';
import * as types from '@core/shared/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { ITenant } from '@shared/interfaces';
import { TenantDto } from './tenants.dto';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

@Controller(APP_CONTROLLERS.TENANTS)
export class TenantsController {

  constructor(
    private readonly repository: TenantsRepository,
    private readonly service: TenantsService,
  ) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<ITenant>): Promise<ITenant[] | IPaginationResponse<ITenant>> {
    return await this.repository.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<ITenant | undefined> {
    return await this.repository.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() tenant: TenantDto): Promise<ITenant | undefined> {
    return await this.repository.save(await this.repository.dtoToEntity(tenant) as ITenant);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() tenant: TenantDto
  ): Promise<ITenant> {
    return await this.repository.updateOne(_id, await this.repository.dtoToEntity(tenant) as ITenant);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<TenantDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.repository.updateMany(filter, await this.repository.dtoToEntity(bulkUpdate.data as TenantDto) as ITenant);
  }

  @Put('delete/avatar/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.UPDATE })
  async deleteTenantAvatar(@Param('_id') _id: string): Promise<boolean> {
    return await this.service.deleteTenantAvatar(_id);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.repository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard)
  @Permissions({ name: PERMISSIONS.TENANTS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.repository.deleteMany(filter);
  }
}