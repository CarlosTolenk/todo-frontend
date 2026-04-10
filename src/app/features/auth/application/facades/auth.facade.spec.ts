import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';

import { User } from '../../domain/entities/user.entity';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  let authFacade: AuthFacade;
  let usersRepositorySpy: {
    findByEmail: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let userSessionRepositorySpy: {
    currentUser$: UserSessionRepository['currentUser$'];
    getCurrentUser: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-09T00:00:00.000Z',
  };

  beforeEach(() => {
    const currentUser$ = new BehaviorSubject<User | null>(null);

    usersRepositorySpy = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    userSessionRepositorySpy = {
      currentUser$,
      getCurrentUser: vi.fn().mockReturnValue(null),
      save: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: UsersRepository, useValue: usersRepositorySpy },
        { provide: UserSessionRepository, useValue: userSessionRepositorySpy },
      ],
    });

    authFacade = TestBed.inject(AuthFacade);
  });

  it('exposes the current session stream and delegates the lookup helpers', async () => {
    usersRepositorySpy.findByEmail.mockReturnValue(of(mockUser));
    userSessionRepositorySpy.getCurrentUser.mockReturnValue(mockUser);

    await expect(firstValueFrom(authFacade.currentUser$)).resolves.toBeNull();
    expect(authFacade.getCurrentUser()).toEqual(mockUser);
    await expect(firstValueFrom(authFacade.findUserByEmail(mockUser.email))).resolves.toEqual(mockUser);
    expect(usersRepositorySpy.findByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  it('persists the created user in session', async () => {
    usersRepositorySpy.create.mockReturnValue(of(mockUser));

    const user = await firstValueFrom(authFacade.createUser(mockUser.email));

    expect(user).toEqual(mockUser);
    expect(usersRepositorySpy.create).toHaveBeenCalledWith({ email: mockUser.email });
    expect(userSessionRepositorySpy.save).toHaveBeenCalledWith(mockUser);
  });

  it('clears session on logout', () => {
    authFacade.logout();

    expect(userSessionRepositorySpy.clear).toHaveBeenCalled();
  });
});
