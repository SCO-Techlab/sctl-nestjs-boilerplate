export interface IPaginationQuery {
  page: number;
  limit: number;
}

export interface IPaginationResponse<T> {
  data: T[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  first: number;
}

export interface IPaginationParams {
  totalPages: number,
  finalPage: number,
  skip: number,
  sanitizedLimit: number
}