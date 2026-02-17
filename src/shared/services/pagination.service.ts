import { Injectable } from "@nestjs/common";
import { DEFAULT_PAGE_LIMIT, MAGIC_NUMBERS } from "../constants";

@Injectable()
export class PaginationService {

  /**
   * Ensures that the requested page and limit values are valid and sets defaults if necessary.
   * @param page - The requested page number.
   * @param limit - The number of items per page.
   * @returns An object with the sanitized page and limit.
   */
  sanitizePaginationParams(page: number, limit: number): { page: number, limit: number } {
    const finalPage = (page && page > MAGIC_NUMBERS.N_0) 
      ? page 
      : MAGIC_NUMBERS.N_1;

    const finalLimit = (limit && limit > MAGIC_NUMBERS.N_0) 
      ? limit 
      : DEFAULT_PAGE_LIMIT;
      
    return { page: finalPage, limit: finalLimit };
  }

  /**
   * Calculates the SKIP (OFFSET) value for the DB query.
   * @param page - The current (sanitized, >= 1) page number.
   * @param limit - The number of items per page.
   * @returns The 'skip' (offset) value to be used in the query.
   */
  getOffset(page: number, limit: number): number {
    return page > MAGIC_NUMBERS.N_0 
      ? (page - MAGIC_NUMBERS.N_1) * limit 
      : MAGIC_NUMBERS.N_0;
  }

  /**
   * Calculates the total number of pages based on the total record count.
   * @param totalRecords - The total count of records in the database.
   * @param limit - The number of items per page.
   * @returns The total number of pages.
   */
  calculateTotalPages(totalRecords: number, limit: number): number {
    return totalRecords <= MAGIC_NUMBERS.N_0 || limit <= MAGIC_NUMBERS.N_0 
      ? MAGIC_NUMBERS.N_0 
      : Math.ceil(totalRecords / limit);
  }

  /**
   * Adjusts the current page if it exceeds the total number of pages available.
   * @param page - The requested page number.
   * @param totalPages - The total number of pages available.
   * @returns The adjusted page (never greater than totalPages).
   */
  capPageNumber(page: number, totalPages: number): number {
    return page > totalPages ? totalPages : page;
  }

  /**
   * Make all the proccesses to get the pagination params.
   * @param page - The requested page number.
   * @param limit - The requested limit.
   * @param totalRecords - The total number of records.
   * @returns The pagination params.
   */
  paginationParams(page: number, limit: number, totalRecords: number): { totalPages: number, finalPage: number, skip: number, sanitizedLimit: number } {
    const { page: sanitizedPage, limit: sanitizedLimit } = this.sanitizePaginationParams(page, limit);
    const totalPages = this.calculateTotalPages(totalRecords, sanitizedLimit);
    const finalPage = this.capPageNumber(sanitizedPage, totalPages);
    const skip = this.getOffset(finalPage, sanitizedLimit);
    return { totalPages, finalPage, skip, sanitizedLimit };
  }
}