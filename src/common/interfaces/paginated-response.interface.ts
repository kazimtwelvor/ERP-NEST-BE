export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  page: number;
  total: number;
  lastPage: number;
}

