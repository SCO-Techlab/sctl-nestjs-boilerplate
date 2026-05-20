import { IUser } from "./users.interface";

export interface IAuthPayload {
  _id: string;
  jti: string;
  isRefreshToken: boolean;
  user: IUser;
}