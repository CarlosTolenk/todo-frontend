import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../../domain/entities/user.entity';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';

const SESSION_STORAGE_KEY = 'atomchat.current-user';

@Injectable({
  providedIn: 'root',
})
export class BrowserUserSessionRepository implements UserSessionRepository {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.readStoredUser());
  readonly currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  save(user: User): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clear(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  private readStoredUser(): User | null {
    const rawValue = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as User;
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }
}
