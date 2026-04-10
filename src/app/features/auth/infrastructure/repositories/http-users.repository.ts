import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/api/api.service';
import { CreateUserPayload, User } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../domain/repositories/users.repository';

@Injectable({
  providedIn: 'root',
})
export class HttpUsersRepository implements UsersRepository {
  constructor(private readonly apiService: ApiService) {}

  findByEmail(email: string): Observable<User | null> {
    return this.apiService.get<User | null>(`/users/by-email/${encodeURIComponent(email)}`);
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.apiService.post<User>('/users', payload);
  }
}
