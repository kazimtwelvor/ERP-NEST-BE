export interface PaginationResponse<T> {
  message: string;
  data: T[];
  page: number;
  total: number;
  lastPage: number;
}

