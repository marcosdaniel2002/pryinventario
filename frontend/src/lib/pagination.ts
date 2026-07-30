export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const DEFAULT_PAGE_SIZE = 10;
