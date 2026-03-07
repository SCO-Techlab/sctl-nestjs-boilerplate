import { IAuthPayload } from "@domains/auth";
import { IUser } from "@domains/users";

export const createJwtPayload = (user: IUser): IAuthPayload => {
  const payload: IAuthPayload = {
    _id: user._id as string,
    user: {
      _id: user._id as string,
      email: user.email,
      password: '',
      userName: user.userName,
      personalName: user.personalName,
      active: user.active,
      emailConfirmed: user.emailConfirmed,
      emailConfirmedAt: user.emailConfirmedAt,
      role: user.role,
      pwdRecoveryToken: user.pwdRecoveryToken,
      pwdRecoveryDate: user.pwdRecoveryDate,
      extension: user.extension,
      createdAt: user.createdAt,
    }
  };

  return payload;
}