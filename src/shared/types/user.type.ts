import { IUser } from "@domains/users";

export type RequestUser = IUser | Partial<IUser> | undefined;