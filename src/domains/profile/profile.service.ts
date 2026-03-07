import { IUser, UsersService, UserUpdateDto } from "@domains/users";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { formatObjectId } from "@shared/helpers";
import { UpdateUserInfoDto } from "./profile.dto";

@Injectable()
export class ProfileService {

  constructor(
    private userService: UsersService
  ) { }

  async updateUserInfo(_id: string, update: UpdateUserInfoDto, requestUser: IUser): Promise<IUser> {
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

    return await this.userService.updateOne(_id, updateUserInfo);
  }
}
