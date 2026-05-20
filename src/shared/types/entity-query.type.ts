import { IPaginationQuery } from "@shared/interfaces";

export type EntityQuery<T> = Partial<T> & Partial<IPaginationQuery>;