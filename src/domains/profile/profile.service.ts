import { BUCKETS, GridfsService, IGridfsFile, IGridfsFileMetadata, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse } from "@core/gridfs";
import { IJwtToken, JwtService } from "@core/jwt";
import { MAGIC_NUMBERS } from "@core/shared/constants";
import { MenuFrontRepository } from "@domains/menu-front";
import { SessionsRepository, SessionsService } from "@domains/sessions";
import { TenantsRepository, TenantsService } from "@domains/tenants";
import { UsersRepository, UsersService } from "@domains/users";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { FILE_SIZES } from "@shared/constants";
import { UpdatePasswordDto } from "@shared/dtos";
import { createJwtPayload, createRandomUUID, formatObjectId } from "@shared/helpers";
import { IMenuFront, ITenant, IUser } from "@shared/interfaces";
import { UpdateUserInfoDto, UpdateUserTenantDto } from "./profile.dto";

@Injectable()
export class ProfileService {

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly gridfsService: GridfsService,
    private readonly sessionsService: SessionsService,
    private readonly sessionsRepository: SessionsRepository,
    private readonly menuFrontRepository: MenuFrontRepository,
    private readonly tenantsRepository: TenantsRepository,
    private readonly tenantsService: TenantsService
  ) { }

  async updateUserInfo(_id: string, update: UpdateUserInfoDto, requestUser: IUser): Promise<IJwtToken> {
    const user: IUser = await this.validateUserRequest(_id, requestUser);

    const updateUserInfo: any = {
      ...user,
      userName: update.userName,
      personalName: update.personalName,
    };

    const updatedUser: IUser = await this.usersRepository.updateOne(_id, updateUserInfo) as IUser;
    if (!updatedUser) {
      throw new NotFoundException('Error updating user');
    }

    const accessToken: string = this.jwtService.createToken(createJwtPayload(updatedUser, createRandomUUID(), false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.updateUserSession(updatedUser, tokenJti);
    return this.jwtService.createTokenResponse(accessToken);
  }

  async updateUserPassword(_id: string, update: UpdatePasswordDto, requestUser: IUser): Promise<boolean> {
    await this.validateUserRequest(_id, requestUser);

    const updatedPassword: boolean = await this.usersService.updatePassword(_id, update.password, update.newPassword, true);
    if (!updatedPassword) {
      throw new NotFoundException('Error updating user password');
    }

    return updatedPassword;
  }

  async getUserAvatar(_id: string, avatarId: string): Promise<IGridfsFileStream> {
    const existUser: IUser = await this.usersRepository.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    const getOptions: IGridfsGetFileOptions = { filter: { _id: avatarId } };
    const avatar: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.AVATARS, getOptions))[MAGIC_NUMBERS.N_0];
    if (!avatar || avatar.metadata?.email !== existUser.email) {
      throw new NotFoundException('Avatar not found');
    }

    const gridfsFileStream: IGridfsFileStream = this.gridfsService.getFileStream(BUCKETS.AVATARS, avatar);
    if (!gridfsFileStream) {
      throw new NotFoundException('Avatar not found');
    }

    return gridfsFileStream;
  }

  async updateUserAvatar(_id: string, file: Express.Multer.File, requestUser: IUser): Promise<IJwtToken> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    if (!file) {
      throw new BadRequestException('File required');
    }

    if (file.size > FILE_SIZES.MB_1) {
      throw new BadRequestException('File size too large (max 1MB)');
    }

    await this.usersService.deleteUserAvatar(_id);
    const avatarMetadata: IGridfsFileMetadata = { mimetype: file.mimetype, email: existUser.email };
    const uploadResponse: IGridfsUploadResponse = (await this.gridfsService.uploadFiles(BUCKETS.AVATARS, [file], avatarMetadata))[MAGIC_NUMBERS.N_0];
    if (!uploadResponse.id) {
      throw new ConflictException('Error uploading user avatar');
    }

    const updatedUser: IUser = await this.usersRepository.updateOne(_id, { avatar: uploadResponse.id }) as IUser;
    if (!updatedUser) {
      throw new NotFoundException('Error updating user');
    }

    const accessToken: string = this.jwtService.createToken(createJwtPayload(updatedUser, createRandomUUID(), false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.updateUserSession(updatedUser, tokenJti);
    return this.jwtService.createTokenResponse(accessToken);
  }

  async deleteUserAvatar(_id: string, requestUser: IUser): Promise<IJwtToken> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);
    const deletedUserAvatar: boolean = await this.usersService.deleteUserAvatar(_id);
    if (!deletedUserAvatar) {
      throw new NotFoundException('Error deleting user avatar');
    }

    const updatedUser: IUser = await this.usersRepository.findOne(_id) as IUser;
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const accessToken: string = this.jwtService.createToken(createJwtPayload(updatedUser, createRandomUUID(), false));
    const tokenJti: string = this.jwtService.getJtiFromToken(accessToken);
    if (!tokenJti) {
      throw new UnauthorizedException();
    }

    await this.sessionsService.updateUserSession(updatedUser, tokenJti);
    return this.jwtService.createTokenResponse(accessToken);
  }

  async deleteUserAccount(_id: string, requestUser: IUser): Promise<boolean> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);
    await this.usersService.deleteUserAvatar(_id);
    await this.sessionsRepository.deleteMany({ user: existUser._id });
    return await this.usersRepository.deleteOne(_id);
  }

  async getUserMenuFront(_id: string, requestUser: IUser): Promise<IMenuFront[]> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    const menuFront: IMenuFront[] = await this.menuFrontRepository
      .find({
        $or: [
          { roles: existUser.role },
          { roles: { $size: MAGIC_NUMBERS.N_0 } },
          { roles: null }
        ]
      } as any) as IMenuFront[];

    if (!menuFront || menuFront.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    return menuFront;
  }

  public async getUserTenants(_id: string, requestUser: IUser): Promise<ITenant[]> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    const tenants: ITenant[] = await this.tenantsRepository.find({
      isActive: true,
      $or: [
        { owner: existUser._id },
        { members: existUser._id },
      ],
    } as any) as ITenant[];

    if (!tenants || tenants.length === MAGIC_NUMBERS.N_0) {
      return [];
    }

    return tenants;
  }

  public async updateUserTenant(_id: string, updateUserTenantDto: UpdateUserTenantDto, requestUser: IUser): Promise<ITenant> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);
    const existTenant: ITenant = await this.tenantsRepository.findOne(updateUserTenantDto?._id) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (formatObjectId(existTenant.owner._id as string) !== formatObjectId(existUser._id as string)) {
      throw new UnauthorizedException();
    }

    const members: IUser[] = [];
    if (updateUserTenantDto.members?.length) {
      for (const memberId of updateUserTenantDto.members) {
        const member = await this.usersRepository.findOne(memberId, '_id');
        if (member) {
          members.push(member);
        }
      }
    }

    const updateTenant: Partial<ITenant> = {
      name: updateUserTenantDto.name ?? existTenant.name,
      description: updateUserTenantDto.description ?? existTenant.description,
      members: members?.length > MAGIC_NUMBERS.N_0 ? members : existTenant.members,
    };

    return await this.tenantsRepository.updateOne(existTenant._id as string, updateTenant) as ITenant;
  }

  async getTenantAvatar(_id: string, tenantId: string, avatarId: string): Promise<IGridfsFileStream> {
    const existUser: IUser = await this.usersRepository.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    const existTenant: ITenant = await this.tenantsRepository.findOne(tenantId) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }


    const getOptions: IGridfsGetFileOptions = { filter: { _id: avatarId } };
    const avatar: IGridfsFile = (await this.gridfsService.getFiles(BUCKETS.TENANTS_AVATARS, getOptions))[MAGIC_NUMBERS.N_0];
    if (!avatar || avatar.metadata?.tenantId !== tenantId) {
      throw new NotFoundException('Avatar not found');
    }

    const gridfsFileStream: IGridfsFileStream = this.gridfsService.getFileStream(BUCKETS.TENANTS_AVATARS, avatar);
    if (!gridfsFileStream) {
      throw new NotFoundException('Avatar not found');
    }

    return gridfsFileStream;
  }

  async updateTenantAvatar(_id: string, tenantId: string, file: Express.Multer.File, requestUser: IUser): Promise<ITenant> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    const existTenant: ITenant = await this.tenantsRepository.findOne(tenantId) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (formatObjectId(existTenant.owner._id as string) !== formatObjectId(existUser._id as string)) {
      throw new UnauthorizedException();
    }

    if (!file) {
      throw new BadRequestException('File required');
    }

    if (file.size > FILE_SIZES.MB_1) {
      throw new BadRequestException('File size too large (max 1MB)');
    }

    await this.tenantsService.deleteTenantAvatar(tenantId);

    const avatarMetadata: IGridfsFileMetadata = { mimetype: file.mimetype, tenantId: tenantId };
    const uploadResponse: IGridfsUploadResponse = (await this.gridfsService.uploadFiles(BUCKETS.TENANTS_AVATARS, [file], avatarMetadata))[MAGIC_NUMBERS.N_0];
    if (!uploadResponse.id) {
      throw new ConflictException('Error uploading tenant avatar');
    }

    const updatedTenant: ITenant = await this.tenantsRepository.updateOne(tenantId, { avatar: uploadResponse.id }) as ITenant;
    if (!updatedTenant) {
      throw new NotFoundException('Error updating tenant');
    }

    return updatedTenant;
  }

  async deleteTenantAvatar(_id: string, tenantId: string, requestUser: IUser): Promise<ITenant> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    const existTenant: ITenant = await this.tenantsRepository.findOne(tenantId) as ITenant;
    if (!existTenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (formatObjectId(existTenant.owner._id as string) !== formatObjectId(existUser._id as string)) {
      throw new UnauthorizedException();
    }

    const deleted = await this.tenantsService.deleteTenantAvatar(tenantId);
    if (!deleted) {
      throw new NotFoundException('Error deleting tenant avatar');
    }


    const updatedTenant: ITenant = await this.tenantsRepository.findOne(tenantId) as ITenant;
    return updatedTenant;
  }

  private async validateUserRequest(_id: string, requestUser: IUser): Promise<IUser> {
    if (_id !== formatObjectId(requestUser._id as string)) {
      throw new UnauthorizedException();
    }

    const existUser: IUser = await this.usersRepository.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    return existUser;
  }
}
