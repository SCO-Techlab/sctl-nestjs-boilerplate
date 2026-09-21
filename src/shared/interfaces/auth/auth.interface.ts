import { ITenant } from "../tenants";
import { IUser } from "../users";

export interface IAuthPayload {
  _id: string;
  jti: string;
  isRefreshToken: boolean;
  user: IUser;
  tenants: ITenant[];
}