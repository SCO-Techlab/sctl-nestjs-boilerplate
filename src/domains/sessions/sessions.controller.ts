import { PERMISSIONS, PERMISSION_TYPE } from '@domains/permissions';
import { Body, Controller, Delete, Get, NotFoundException, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { APP_CONTROLLERS } from '@shared/constants';
import { Permissions } from '@shared/decorators';
import { MongodbBulkDeleteDto } from '@shared/dtos';
import { PermissionsGuard } from '@shared/guards';
import { IPaginationResponse } from '@shared/interfaces';
import * as types from '@shared/types';
import { RefreshSessionsService } from './refresh-sessions.service';
import { ISession } from './sessions.interface';
import { SessionsService } from './sessions.service';

@Controller(APP_CONTROLLERS.SESSIONS)
export class SessionsController {

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly refreshSessionsService: RefreshSessionsService,
  ) { }

  @Get('/:refresh')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.READ })
  async find(
    @Param('refresh') refresh: string,
    @Query() query?: types.IEntityQuery<ISession>
  ): Promise<ISession[] | IPaginationResponse<ISession>> {
    const isRefresh: boolean = refresh === 'true';
    return !isRefresh
      ? await this.sessionsService.find(query)
      : await this.refreshSessionsService.find(query);
  }

  @Put('revoke/:_id/:refresh')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.UPDATE })
  async updateOne(
    @Param('_id') _id: string,
    @Param('refresh') refresh: string
  ): Promise<ISession | undefined> {
    const isRefresh: boolean = refresh === 'true';

    const value: ISession = !isRefresh
      ? await this.sessionsService.findOne(_id) as ISession
      : await this.refreshSessionsService.findOne(_id) as ISession;

    if (!value) {
      throw new NotFoundException(`Session with id ${_id} not found`);
    }

    value.isRevoked = true;
    value.revokedAt = new Date();
    return !isRefresh
      ? await this.sessionsService.updateOne(_id, value)
      : await this.refreshSessionsService.updateOne(_id, value);
  }

  @Delete(':_id/:refresh')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.DELETE })
  async deleteOne(
    @Param('_id') _id: string,
    @Param('refresh') refresh: string
  ): Promise<boolean> {
    const isRefresh: boolean = refresh === 'true';
    return !isRefresh
      ? await this.sessionsService.deleteOne(_id)
      : await this.refreshSessionsService.deleteOne(_id);
  }

  @Delete('delete/bulk/:refresh')
  @UseGuards(AuthGuard(), PermissionsGuard)
  @Permissions({ name: PERMISSIONS.SESSIONS, type: PERMISSION_TYPE.DELETE_BULK })
  async deleteMany(
    @Param('refresh') refresh: string,
    @Body() bulkDelete: MongodbBulkDeleteDto
  ): Promise<number> {
    const isRefresh: boolean = refresh === 'true';
    const filter = { _id: { $in: bulkDelete._ids } };
    return !isRefresh
      ? await this.sessionsService.deleteMany(filter)
      : await this.refreshSessionsService.deleteMany(filter);
  }
}
