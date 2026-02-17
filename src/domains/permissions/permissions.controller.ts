import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, MAGIC_STRINGS } from '@shared/constants';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { PermissionDto } from './permissions.dto';
import { IPermission } from './permissions.interface';
import { PermissionsService } from './permissions.service';

@Controller(APP_CONTROLLERS.PERMISSIONS)
export class PermissionsController {

  constructor(private permissionsService: PermissionsService) { }

  @Get()
  @UseGuards(AuthGuard())
  async find(@Query() query?: types.IEntityQuery<IPermission>): Promise<IPermission[] | IPaginationResponse<IPermission>> {
    return await this.permissionsService.find(query);
  }

  @Get(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async findOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<IPermission | undefined> {
    return await this.permissionsService.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async save(@Body() permission: PermissionDto): Promise<IPermission | undefined> {
    const existPermissionName: IPermission = await this.permissionsService.findOne(permission.name, MAGIC_STRINGS.NAME) as IPermission;
    if (existPermissionName) {
      console.error(`[PermissionsController] save -> Permission with name '${permission.name}' already exists`);
      throw new BadRequestException(`Permission with name '${permission.name}' already exists`);
    }

    return await this.permissionsService.save(permission);
  }

  @Put(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async updateOne(
    @Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string,
    @Body() permission: PermissionDto
  ): Promise<IPermission | undefined> {
    const existPermission: IPermission = await this.permissionsService.findOne(_id) as IPermission;
    if (!existPermission) {
      console.error(`[PermissionsController] updateOne -> Permission with id '${_id}' does not exist`);
      throw new BadRequestException(`Permission with id '${_id}' does not exist`);
    }

    if (existPermission.name !== permission.name) {
      const updatePermissionName: IPermission = await this.permissionsService.findOne(permission.name, MAGIC_STRINGS.NAME) as IPermission;
      if (updatePermissionName) {
        console.error(`[PermissionsController] updateOne -> Permission with name '${permission.name}' already exists`);
        throw new BadRequestException(`Permission with name '${permission.name}' already exists`);
      }
    }

    return await this.permissionsService.updateOne(_id, permission);
  }

  @Delete(MAGIC_STRINGS.UNDERSCORE_ID_PARAM)
  @UseGuards(AuthGuard())
  async deleteOne(@Param(MAGIC_STRINGS.UNDERSCORE_ID) _id: string): Promise<boolean> {
    const existPermission: IPermission = await this.permissionsService.findOne(_id) as IPermission;
    if (!existPermission) {
      console.error(`[PermissionsController] deleteOne -> Permission with id '${_id}' does not exist`);
      throw new BadRequestException(`Permission with id '${_id}' does not exist`);
    }

    return await this.permissionsService.deleteOne(_id);
  }
}
