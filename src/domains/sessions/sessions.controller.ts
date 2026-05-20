import { MongodbBulkDeleteDto } from '@core/shared/dtos';
import { IPaginationResponse } from '@core/shared/interfaces';
import * as types from '@core/shared/types';
import { Body, Controller, Delete, Get, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS, PERMISSIONS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { PERMISSION_TYPE } from '@shared/enums';
import { PermissionsGuard } from '@shared/guards';
import { ISession } from '@shared/interfaces';
import { SessionsService } from './sessions.service';

@Controller(APP_CONTROLLERS.SESSIONS)
export class SessionsController {

  constructor(
    private readonly sessionsService: SessionsService,
  ) { }

  @Get()
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.READ })
  async find(@Query() query?: types.EntityQuery<ISession>): Promise<ISession[] | IPaginationResponse<ISession>> {
    return await this.sessionsService.find(query);
  }

  @Put('revoke/:_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(@Param('_id') _id: string): Promise<ISession | undefined> {
    const value: ISession = await this.sessionsService.findOne(_id) as ISession;
    if (!value) {
      throw new NotFoundException(`Session with id ${_id} not found`);
    }

    value.isRevoked = true;
    value.revokedAt = new Date();
    return await this.sessionsService.updateOne(_id, value);
  }

  @Delete(':_id')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(@Param('_id') _id: string): Promise<boolean> {
    return await this.sessionsService.deleteOne(_id);
  }

  @Delete('delete/bulk')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(@Body() bulkDelete: MongodbBulkDeleteDto): Promise<number> {
    const filter = { _id: { $in: bulkDelete._ids } };
    return await this.sessionsService.deleteMany(filter);
  }
}
