import { IUser } from "@domains/users";

export type IRequestUser = IUser | Partial<IUser> | undefined;