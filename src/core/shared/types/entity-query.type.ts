import { IPaginationQuery } from "../interfaces";

export type EntityQuery<T> = Partial<T> & Partial<IPaginationQuery>;