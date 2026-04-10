import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { User } from '../../domain/entities/user.entity';
import { UserSessionRepository } from '../../domain/repositories/user-session.repository';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  let authFacade: AuthFacade;
  let usersRepositorySpy: jasmine.SpyObj<UsersRepository>;
  let userSessionRepositorySpy: jasmine.SpyObj<UserSessionRepository>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-09T00:00:00.000Z',
  };

  beforeEach(() => {
    usersRepositorySpy = jasmine.createSpyObj<UsersRepository>('UsersRepository', ['findByEmail', 'create']);
    userSessionRepositorySpy = jasmine.createSpyObj<UserSessionRepository>(
      'UserSessionRepository',
      ['getCurrentUser', 'save', 'clear'],
      {
        currentUser$: of(null),
      },
    );

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: UsersRepository, useValue: usersRepositorySpy },
        { provide: UserSessionRepository, useValue: userSessionRepositorySpy },
      ],
    });

    authFacade = TestBed.inject(AuthFacade);
  });

  it('persists the created user in session', (done) => {
    usersRepositorySpy.create.and.returnValue(of(mockUser));

    authFacade.createUser(mockUser.email).subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(usersRepositorySpy.create).toHaveBeenCalledWith({ email: mockUser.email });
      expect(userSessionRepositorySpy.save).toHaveBeenCalledWith(mockUser);
      done();
    });
  });

  it('clears session on logout', () => {
    authFacade.logout();

    expect(userSessionRepositorySpy.clear).toHaveBeenCalled();
  });
});
