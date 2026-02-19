import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@shared/dtos';
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
  async find(@Query() query?: types.IEntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    return await this.permissionsService.find(query);
  }

  @Get(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.READ })
  async findOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<IPermission | undefined> {
    return await this.permissionsService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.CREATE })
  async save(@Body() permission: PermissionCreateDto): Promise<IPermission> {
    return await this.permissionsService.save(permission);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() permission: PermissionUpdateDto
  ): Promise<IPermission | undefined> {
    return await this.permissionsService.updateOne(_id, permission);
  }

  @Put(`${MAGIC_STRINGS.UPDATE}${MAGIC_STRINGS.SLASH}${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<PermissionUpdateDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.permissionsService.updateMany(filter, bulkUpdate.data);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    return await this.permissionsService.deleteOne(_id);
  }

  @Delete(`${MAGIC_STRINGS.DELETE}${MAGIC_STRINGS.SLASH}${MAGIC_STRINGS.BULK}`)
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.PERMISSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.permissionsService.deleteMany(filter);
  }
}
