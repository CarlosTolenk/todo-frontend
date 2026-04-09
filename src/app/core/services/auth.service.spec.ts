import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { User } from '../models/api.models';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { UsersApiService } from './users-api.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersApiServiceSpy: jasmine.SpyObj<UsersApiService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-09T00:00:00.000Z',
  };

  beforeEach(() => {
    usersApiServiceSpy = jasmine.createSpyObj<UsersApiService>('UsersApiService', ['getByEmail', 'create']);
    sessionServiceSpy = jasmine.createSpyObj<SessionService>('SessionService', ['getCurrentUser', 'setCurrentUser', 'clear'], {
      currentUser$: of(null),
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: UsersApiService, useValue: usersApiServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('persists the created user in session', (done) => {
    usersApiServiceSpy.create.and.returnValue(of(mockUser));

    authService.createUser(mockUser.email).subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(usersApiServiceSpy.create).toHaveBeenCalledWith({ email: mockUser.email });
      expect(sessionServiceSpy.setCurrentUser).toHaveBeenCalledWith(mockUser);
      done();
    });
  });

  it('clears session on logout', () => {
    authService.logout();

    expect(sessionServiceSpy.clear).toHaveBeenCalled();
  });
});
