import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/mongodb';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { PermissionsGuard } from '@shared/guards';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { PERMISSIONS } from './permissions.constants';
import { PermissionCreateDto, PermissionUpdateDto } from './permissions.dto';
import { PERMISSION_TYPE } from './permissions.enum';
import { IPermission } from './permissions.interface';
import { PermissionsService } from './permissions.service';

@Controller(APP_CONTROLLERS.PERMISSIONS)
export class PermissionsController {

  constructor(private permissionsService: PermissionsService) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    return await this.permissionsService.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IPermission | undefined> {
    return await this.permissionsService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() permission: PermissionCreateDto): Promise<IPermission | undefined> {
    return await this.permissionsService.save(permission);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() permission: PermissionUpdateDto
  ): Promise<IPermission | undefined> {
    return await this.permissionsService.updateOne(_id, permission);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<PermissionUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.permissionsService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.permissionsService.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.permissionsService.deleteMany(filter);
  }
}
