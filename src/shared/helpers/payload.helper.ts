import { IAuthPayload, IUser } from "@shared/interfaces";

export const createJwtPayload = (user: IUser, jti: string, refreshToken: boolean): IAuthPayload => {
  const payload: IAuthPayload = {
    _id: `${user._id}_${jti}`,
    jti,
    isRefreshToken: refreshToken,
    user: {
      ...user['_doc'],
      password: '',
    }
  };

  return payload;
}