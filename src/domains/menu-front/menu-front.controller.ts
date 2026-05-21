import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/shared/dtos';
import { IPaginationResponse } from '@core/shared/interfaces';
import * as types from '@core/shared/types';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { IMenuFront } from '@shared/interfaces';
import { MenuFrontDto } from './menu-front.dto';
import { MenuFrontRepository } from './menu-front.repository';

@Controller(APP_CONTROLLERS.MENU_FRONT)
export class MenuFrontController {

  constructor(private readonly repository: MenuFrontRepository) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<IMenuFront>): Promise<IMenuFront[] | IPaginationResponse<IMenuFront>> {
    return await this.repository.find(query);
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.READ })
  async findOne(@Param('_id') _id: string): Promise<IMenuFront | undefined> {
    return await this.repository.findOne(_id);
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.CREATE })
  async save(@Body() menuFront: MenuFrontDto): Promise<IMenuFront | undefined> {
    return await this.repository.save(await this.repository.dtoToEntity(menuFront) as IMenuFront);
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Body() menuFront: MenuFrontDto
  ): Promise<IMenuFront | undefined> {
    return await this.repository.updateOne(_id, await this.repository.dtoToEntity(menuFront) as IMenuFront);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(@Body() bulkUpdate: MongodbBulkUpdateDto<MenuFrontDto>): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids } };
    return await this.repository.updateMany(filter, await this.repository.dtoToEntity(bulkUpdate.data as MenuFrontDto) as IMenuFront);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.repository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.MENU_FRONT, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.repository.deleteMany(filter);
  }
}
