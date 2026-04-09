import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { User } from '../models/api.models';
import { SessionService } from './session.service';
import { UsersApiService } from './users-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly currentUser$ = this.sessionService.currentUser$;

  constructor(
    private readonly usersApiService: UsersApiService,
    private readonly sessionService: SessionService,
  ) {}

  getCurrentUser(): User | null {
    return this.sessionService.getCurrentUser();
  }

  findUserByEmail(email: string): Observable<User | null> {
    return this.usersApiService.getByEmail(email);
  }

  createUser(email: string): Observable<User> {
    return this.usersApiService.create({ email }).pipe(tap((user) => this.sessionService.setCurrentUser(user)));
  }

  persistSession(user: User): void {
    this.sessionService.setCurrentUser(user);
  }

  logout(): void {
    this.sessionService.clear();
  }
}
