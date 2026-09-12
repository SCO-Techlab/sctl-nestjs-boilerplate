import { IPaginationQuery } from "@core/pagination";

export type EntityQuery<T> = Partial<T> & Partial<IPaginationQuery>;