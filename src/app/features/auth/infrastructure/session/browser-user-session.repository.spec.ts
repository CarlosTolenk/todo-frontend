import { TestBed } from '@angular/core/testing';

import { User } from '../../domain/entities/user.entity';
import { BrowserUserSessionRepository } from './browser-user-session.repository';

describe('BrowserUserSessionRepository', () => {
  const storageKey = 'atomchat.current-user';

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts without a session when storage is empty', () => {
    TestBed.configureTestingModule({
      providers: [BrowserUserSessionRepository],
    });

    const repository = TestBed.inject(BrowserUserSessionRepository);

    expect(repository.getCurrentUser()).toBeNull();
  });

  it('loads the stored user and updates storage on save and clear', () => {
    sessionStorage.setItem(storageKey, JSON.stringify(mockUser));

    TestBed.configureTestingModule({
      providers: [BrowserUserSessionRepository],
    });

    const repository = TestBed.inject(BrowserUserSessionRepository);
    const emissions: Array<User | null> = [];
    const subscription = repository.currentUser$.subscribe((user) => emissions.push(user));

    expect(repository.getCurrentUser()).toEqual(mockUser);

    const nextUser = { ...mockUser, email: 'new@example.com' };
    repository.save(nextUser);
    repository.clear();

    expect(sessionStorage.getItem(storageKey)).toBeNull();
    expect(repository.getCurrentUser()).toBeNull();
    expect(emissions).toEqual([mockUser, nextUser, null]);

    subscription.unsubscribe();
  });

  it('removes malformed stored data and resets the session', () => {
    sessionStorage.setItem(storageKey, '{invalid-json');

    TestBed.configureTestingModule({
      providers: [BrowserUserSessionRepository],
    });

    const repository = TestBed.inject(BrowserUserSessionRepository);

    expect(repository.getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });
});
