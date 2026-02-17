import { IPaginationQuery } from "../interfaces";

export type IEntityQuery<T> = Partial<T> & Partial<IPaginationQuery>;