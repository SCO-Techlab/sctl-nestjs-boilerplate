import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/shared/dtos';
import { IPaginationResponse } from '@core/shared/interfaces';
import * as types from '@core/shared/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { IPermission } from '@shared/interfaces';
import { PermissionCreateDto, PermissionUpdateDto } from './permissions.dto';
import { PermissionsRepository } from './permissions.repository';

@Controller(APP_CONTROLLERS.PERMISSIONS)
export class PermissionsController {

  constructor(private readonly repository: PermissionsRepository) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    return await this.repository.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IPermission | undefined> {
    return await this.repository.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() permission: PermissionCreateDto): Promise<IPermission | undefined> {
    return await this.repository.save(permission);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() permission: PermissionUpdateDto
  ): Promise<IPermission | undefined> {
    return await this.repository.updateOne(_id, permission);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<PermissionUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.repository.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.repository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.repository.deleteMany(filter);
  }
}
