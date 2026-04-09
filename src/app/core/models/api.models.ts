export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
}

export interface CreateTaskPayload {
  userId: string;
  title: string;
  description: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
}
