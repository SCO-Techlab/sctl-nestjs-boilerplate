import { Injectable } from "@nestjs/common";
import { DEFAULT_PAGE_LIMIT, MAGIC_NUMBERS } from "../constants";

@Injectable()
export class PaginationService {

  sanitizePaginationParams(page: number, limit: number): { page: number, limit: number } {
    const finalPage = (page && page > MAGIC_NUMBERS.N_0) 
      ? page 
      : MAGIC_NUMBERS.N_1;

    const finalLimit = (limit && limit > MAGIC_NUMBERS.N_0) 
      ? limit 
      : DEFAULT_PAGE_LIMIT;
      
    return { page: finalPage, limit: finalLimit };
  }

  getOffset(page: number, limit: number): number {
    return page > MAGIC_NUMBERS.N_0 
      ? (page - MAGIC_NUMBERS.N_1) * limit 
      : MAGIC_NUMBERS.N_0;
  }

  calculateTotalPages(totalRecords: number, limit: number): number {
    return totalRecords <= MAGIC_NUMBERS.N_0 || limit <= MAGIC_NUMBERS.N_0 
      ? MAGIC_NUMBERS.N_0 
      : Math.ceil(totalRecords / limit);
  }

  capPageNumber(page: number, totalPages: number): number {
    return page > totalPages ? totalPages : page;
  }

  paginationParams(page: number, limit: number, totalRecords: number): { totalPages: number, finalPage: number, skip: number, sanitizedLimit: number } {
    const { page: sanitizedPage, limit: sanitizedLimit } = this.sanitizePaginationParams(page, limit);
    const totalPages = this.calculateTotalPages(totalRecords, sanitizedLimit);
    const finalPage = this.capPageNumber(sanitizedPage, totalPages);
    const skip = this.getOffset(finalPage, sanitizedLimit);
    return { totalPages, finalPage, skip, sanitizedLimit };
  }
}