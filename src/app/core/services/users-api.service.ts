import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api/api.service';
import { CreateUserPayload, User } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  constructor(private readonly apiService: ApiService) {}

  getByEmail(email: string): Observable<User | null> {
    return this.apiService.get<User | null>(`/users/by-email/${encodeURIComponent(email)}`);
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.apiService.post<User>('/users', payload);
  }
}
