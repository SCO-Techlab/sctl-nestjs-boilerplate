import { IUser, UsersService, UserUpdateDto } from "@domains/users";
import { IJwtToken, JwtService } from "@modules/jwt";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createJwtPayload, formatObjectId } from "@shared/helpers";
import { UpdateUserInfoDto } from "./profile.dto";

@Injectable()
export class ProfileService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) { }

  async updateUserInfo(_id: string, update: UpdateUserInfoDto, requestUser: IUser): Promise<IJwtToken> {
    if (_id !== formatObjectId(requestUser._id as string)) {
      throw new UnauthorizedException();
    }

    const existUser: IUser = await this.userService.findOne(_id) as IUser;
    if (!existUser) {
      throw new NotFoundException('User not found');
    }

    const updateUserInfo: UserUpdateDto = {
      userName: update.userName,
      personalName: update.personalName,
    };

    const updatedUser: IUser = await this.userService.updateOne(_id, updateUserInfo) as IUser;
    if (!updatedUser) {
      throw new NotFoundException('Error updating user');
    }

    const token: IJwtToken = this.jwtService.createToken(createJwtPayload(updatedUser)) as IJwtToken;
    if (!token) {
      throw new UnauthorizedException();
    }

    return token;
  }
}
