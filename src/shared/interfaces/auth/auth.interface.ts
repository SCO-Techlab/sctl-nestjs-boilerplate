import { IUser } from "../users";

export interface IAuthPayload {
  _id: string;
  jti: string;
  isRefreshToken: boolean;
  user: IUser;
}