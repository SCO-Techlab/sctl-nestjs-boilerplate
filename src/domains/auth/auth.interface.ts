import { IUser } from "@domains/users";

export interface IAuthPayload {
  _id: string;
  jti: string;
  isRefreshToken: boolean;
  user: IUser;
}