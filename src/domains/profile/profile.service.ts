import { GridfsService } from "@core/gridfs";
import { JwtService } from "@core/jwt";
import { BUCKETS, MAGIC_NUMBERS } from "@core/shared/constants";
import { IGridfsFile, IGridfsFileMetadata, IGridfsFileStream, IGridfsGetFileOptions, IGridfsUploadResponse, IJwtToken } from "@core/shared/interfaces";
import { MenuFrontService } from "@domains/menu-front";
import { SessionsService } from "@domains/sessions";
import { UsersService } from "@domains/users";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { FILE_SIZES } from "@shared/constants";
import { createJwtPayload, createRandomUUID, formatObjectId } from "@shared/helpers";
import { IMenuFront, IUser } from "@shared/interfaces";
import { UpdateUserInfoDto, UpdateUserPasswordDto } from "./profile.dto";

@Injectable()
export class ProfileService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private gridfsService: GridfsService,
    private sessionsService: SessionsService,
    private menuFrontService: MenuFrontService
  ) { }

  async updateUserInfo(_id: string, update: UpdateUserInfoDto, requestUser: IUser): Promise<IJwtToken> {
    const user: IUser = await this.validateUserRequest(_id, requestUser);

    const updateUserInfo: any = {
      ...user,
      userName: update.userName,
      personalName: update.personalName,
    };

    const updatedUser: IUser = await this.userService.updateOne(_id, updateUserInfo) as IUser;
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

  async updateUserPassword(_id: string, update: UpdateUserPasswordDto, requestUser: IUser): Promise<boolean> {
    await this.validateUserRequest(_id, requestUser);

    const updatedPassword: boolean = await this.userService.updatePassword(_id, update, true);
    if (!updatedPassword) {
      throw new NotFoundException('Error updating user password');
    }

    return updatedPassword;
  }

  async getUserAvatar(_id: string, avatarId: string): Promise<IGridfsFileStream> {
    const existUser: IUser = await this.userService.findOne(_id) as IUser;
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

    await this.userService.deleteUserAvatar(_id);
    const avatarMetadata: IGridfsFileMetadata = { mimetype: file.mimetype, email: existUser.email };
    const uploadResponse: IGridfsUploadResponse = (await this.gridfsService.uploadFiles(BUCKETS.AVATARS, [file], avatarMetadata))[MAGIC_NUMBERS.N_0];
    if (!uploadResponse.id) {
      throw new ConflictException('Error uploading user avatar');
    }

    const updatedUser: IUser = await this.userService.updateOne(_id, { avatar: uploadResponse.id }) as IUser;
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
    await this.userService.deleteUserAvatar(_id);
    await this.sessionsService.deleteMany({ user: existUser._id });
    return await this.userService.deleteOne(_id);
  }

  async getUserMenuFront(_id: string, requestUser: IUser): Promise<IMenuFront[]> {
    const existUser: IUser = await this.validateUserRequest(_id, requestUser);

    const menuFront: IMenuFront[] = await this.menuFrontService
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

    return this.menuFrontService.sortMenuRecursive(menuFront);
  }

  private async validateUserRequest(_id: string, requestUser: IUser): Promise<IUser> {
    if (_id !== formatObjectId(requestUser._id as string)) {
      throw new UnauthorizedException();
    }

    const existUser: IUser = await this.userService.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    return existUser;
  }
}
