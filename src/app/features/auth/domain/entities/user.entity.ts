export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
}
