import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SessionService } from '../services/session.service';
import { sessionGuard } from './session.guard';

describe('sessionGuard', () => {
  it('allows navigation when a user exists in session', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionService,
          useValue: {
            getCurrentUser: () => ({ id: '1', email: 'test@example.com', createdAt: '2026-04-09T00:00:00.000Z' }),
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy('createUrlTree'),
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() => sessionGuard({} as never, {} as never));

    expect(result).toBeTrue();
  });

  it('redirects to login when the session is empty', () => {
    const urlTree = {} as ReturnType<Router['createUrlTree']>;
    const createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionService,
          useValue: {
            getCurrentUser: () => null,
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree,
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() => sessionGuard({} as never, {} as never));

    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });
});
