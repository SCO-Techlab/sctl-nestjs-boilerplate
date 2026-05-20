import { Injectable } from "@nestjs/common";
import { DEFAULT_PAGE_LIMIT, MAGIC_NUMBERS } from "@shared/constants";
import { IPaginationParams, IPaginationQuery } from "@shared/interfaces";

@Injectable()
export class PaginationService {

  public sanitizePaginationParams(page: number, limit: number): IPaginationQuery {
    const finalPage = (page && page > MAGIC_NUMBERS.N_0)
      ? page
      : MAGIC_NUMBERS.N_1;

    const finalLimit = (limit && limit > MAGIC_NUMBERS.N_0)
      ? limit
      : DEFAULT_PAGE_LIMIT;

    return { page: finalPage, limit: finalLimit };
  }

  public getOffset(page: number, limit: number): number {
    return page > MAGIC_NUMBERS.N_0
      ? (page - MAGIC_NUMBERS.N_1) * limit
      : MAGIC_NUMBERS.N_0;
  }

  public calculateTotalPages(totalRecords: number, limit: number): number {
    return totalRecords <= MAGIC_NUMBERS.N_0 || limit <= MAGIC_NUMBERS.N_0
      ? MAGIC_NUMBERS.N_0
      : Math.ceil(totalRecords / limit);
  }

  public capPageNumber(page: number, totalPages: number): number {
    return page > totalPages
      ? totalPages
      : page;
  }

  public paginationParams(page: number, limit: number, totalRecords: number): IPaginationParams {
    const { page: sanitizedPage, limit: sanitizedLimit } = this.sanitizePaginationParams(page, limit);
    const totalPages = this.calculateTotalPages(totalRecords, sanitizedLimit);
    const finalPage = this.capPageNumber(sanitizedPage, totalPages);
    const skip = this.getOffset(finalPage, sanitizedLimit);
    return { totalPages, finalPage, skip, sanitizedLimit };
  }
}