import { GridfsService } from "@core/gridfs";
import { JwtService } from "@core/jwt";
import { BUCKETS, MAGIC_NUMBERS } from "@core/shared/constants";
import { IGridfsFile, IGridfsFileMetadata, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse, IJwtToken } from "@core/shared/interfaces";
import { MenuFrontRepository } from "@domains/menu-front";
import { SessionsRepository, SessionsService } from "@domains/sessions";
import { UsersRepository, UsersService } from "@domains/users";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { FILE_SIZES } from "@shared/constants";
import { UpdatePasswordDto } from "@shared/dtos";
import { createJwtPayload, createRandomUUID, formatObjectId } from "@shared/helpers";
import { IMenuFront, IUser } from "@shared/interfaces";
import { UpdateUserInfoDto } from "./profile.dto";

@Injectable()
export class ProfileService {

  constructor(
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private jwtService: JwtService,
    private gridfsService: GridfsService,
    private sessionsService: SessionsService,
    private sessionsRepository: SessionsRepository,
    private menuFrontRepository: MenuFrontRepository
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
