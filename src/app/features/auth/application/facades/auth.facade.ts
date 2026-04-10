import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { CreateUserPayload, User } from '../../domain/entities/user.entity';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { UsersRepository } from '../../domain/repositories/users.repository';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  readonly currentUser$ = this.userSessionRepository.currentUser$;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  getCurrentUser(): User | null {
    return this.userSessionRepository.getCurrentUser();
  }

  findUserByEmail(email: string): Observable<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  createUser(email: string): Observable<User> {
    const payload: CreateUserPayload = { email };

    return this.usersRepository.create(payload).pipe(tap((user) => this.userSessionRepository.save(user)));
  }

  persistSession(user: User): void {
    this.userSessionRepository.save(user);
  }

  logout(): void {
    this.userSessionRepository.clear();
  }
}
