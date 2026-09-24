import { IGridfsFileStream } from '@core/gridfs';
import { MultitenancyEnabledGuard, TenantsGuard } from '@core/guards';
import { MongodbBulkDeleteDto, MongodbBulkUpdateDto } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared';
import { TenantDto } from '@domains/tenants/tenants.dto';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions, Tenant } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { formatObjectId } from '@shared/helpers';
import { IRoom } from '@shared/interfaces';
import express from 'express';
import { RoomDto } from './rooms.dto';
import { RoomsRepository } from './rooms.repository';
import { RoomsService } from './rooms.service';

@Controller(APP_CONTROLLERS.ROOMS)
export class RoomsController {

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly roomsService: RoomsService,
  ) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.READ })
  async find(
    @Tenant() tenantId: string,
    @Query() query: any
  ): Promise<IRoom[] | any> {
    return this.roomsRepository.find({ ...query, tenant: tenantId });
  }

  @Get(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.READ })
  async findOne(
    @Tenant() tenantId: string,
    @Param('_id') _id: string
  ): Promise<IRoom | undefined> {
    const value = await this.roomsRepository.findOne(_id, '_id') as IRoom;
    if (formatObjectId(String(value?.tenant?._id ?? value?.tenant)) !== formatObjectId(tenantId)) {
      return undefined;
    }

    return value;
  }

  @Post()
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.CREATE })
  async create(
    @Tenant() tenantId: string,
    @Body() dto: RoomDto
  ): Promise<IRoom> {
    if (formatObjectId(dto.tenant) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    const entity = await this.roomsRepository.dtoToEntity(dto);
    return await this.roomsRepository.save(entity as IRoom) as IRoom;
  }

  @Put(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.UPDATE })
  async update(
    @Tenant() tenantId: string,
    @Param('_id') _id: string,
    @Body() dto: RoomDto
  ): Promise<IRoom> {
    const currentRoom = await this.roomsRepository.findOne(_id, '_id') as IRoom;
    if (!currentRoom) {
      throw new NotFoundException('Room not found');
    }

    const tenantValue = dto?.tenant ?? String(currentRoom.tenant?._id ?? currentRoom.tenant ?? '');
    if (tenantValue && formatObjectId(tenantValue) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    const dtoWithCurrentValues: RoomDto = {
      ...dto,
      _id,
      tenant: String((tenantValue || String(currentRoom.tenant?._id ?? currentRoom.tenant ?? '')) ?? ''),
      residence: String(dto?.residence ?? currentRoom.residence?._id ?? currentRoom.residence ?? ''),
    } as RoomDto;

    const entity = await this.roomsRepository.dtoToEntity(dtoWithCurrentValues);
    return this.roomsRepository.updateOne(_id, entity as IRoom);
  }

  @Put('update/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.UPDATE_BULK })
  async updateMany(
    @Tenant() tenantId: string,
    @Body() bulkUpdate: MongodbBulkUpdateDto<TenantDto>
  ): Promise<number> {
    const filter = { _id: { $in: bulkUpdate._ids }, tenant: tenantId };
    return await this.roomsRepository.updateMany(filter, bulkUpdate.data);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.DELETE })
  async delete(
    @Tenant() tenantId: string,
    @Param('_id') _id: string
  ): Promise<boolean> {
    const value = await this.roomsRepository.findOne(_id, '_id') as IRoom;
    if (formatObjectId(String(value?.tenant?._id ?? value?.tenant)) !== formatObjectId(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    return this.roomsRepository.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(
    @Tenant() tenantId: string,
    @Body() bulkDelete: MongodbBulkDeleteDto
  ): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids }, tenant: tenantId };
    return await this.roomsRepository.deleteMany(filter);
  }

  @Get('get/image/:roomId/:imageId/:tenantId')
  async getRoomImage(
    @Param('roomId') roomId: string,
    @Param('imageId') imageId: string,
    @Param('tenantId') tenantId: string,
    @Res() res: express.Response
  ) {
    const gridfsFileStream: IGridfsFileStream = await this.roomsService.getRoomImage(roomId, tenantId, imageId);

    res.set({
      'Content-Type': gridfsFileStream.file.metadata?.mimetype,
      'Content-Length': gridfsFileStream.file.length,
    });

    gridfsFileStream.stream.pipe(res);
  }

  @Put('images/:roomId')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.UPDATE })
  @UseInterceptors(FilesInterceptor('files', MAGIC_NUMBERS.N_5))
  async addRoomImages(
    @Tenant() tenantId: string,
    @Param('roomId') roomId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<IRoom> {
    return await this.roomsService.addRoomImages(roomId, tenantId, files);
  }

  @Delete('delete/image/:roomId/:imageId')
  @UseGuards(AuthGuard(), PermissionsGuard, MultitenancyEnabledGuard, TenantsGuard)
  @Permissions({ name: PERMISSIONS.ROOMS, type: PERMISSION_TYPE.UPDATE })
  async deleteRoomImage(
    @Tenant() tenantId: string,
    @Param('roomId') roomId: string,
    @Param('imageId') imageId: string,
  ): Promise<IRoom> {
    return await this.roomsService.deleteRoomImage(roomId, tenantId, imageId);
  }
}
