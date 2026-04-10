import { of, throwError } from 'rxjs';

import { User } from '../../../domain/entities/user.entity';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let authFacade: {
    currentUser$: unknown;
    getCurrentUser: ReturnType<typeof vi.fn>;
    findUserByEmail: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    persistSession: ReturnType<typeof vi.fn>;
  };
  let dialog: {
    open: ReturnType<typeof vi.fn>;
  };
  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  beforeEach(() => {
    authFacade = {
      currentUser$: of(null),
      getCurrentUser: vi.fn().mockReturnValue(null),
      findUserByEmail: vi.fn(),
      createUser: vi.fn(),
      persistSession: vi.fn(),
    };
    dialog = {
      open: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    component = new LoginPageComponent(authFacade as never, dialog as never, router as never);
  });

  it('redirects to tasks on init when there is already an active session', () => {
    authFacade.getCurrentUser.mockReturnValue(mockUser);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('logs in an existing user without opening the creation dialog', async () => {
    authFacade.findUserByEmail.mockReturnValue(of(mockUser));

    await component.onSubmit('test@example.com');

    expect(authFacade.persistSession).toHaveBeenCalledWith(mockUser);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(component.loading$.value).toBe(false);
  });

  it('creates a user after confirmation when the email does not exist', async () => {
    authFacade.findUserByEmail.mockReturnValue(of(null));
    authFacade.createUser.mockReturnValue(of(mockUser));
    dialog.open.mockReturnValue({
      afterClosed: () => of(true),
    });

    await component.onSubmit('test@example.com');

    expect(dialog.open).toHaveBeenCalled();
    expect(authFacade.createUser).toHaveBeenCalledWith('test@example.com');
    expect(authFacade.persistSession).toHaveBeenCalledWith(mockUser);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    expect(component.loading$.value).toBe(false);
  });

  it('stops the flow when the user cancels creation', async () => {
    authFacade.findUserByEmail.mockReturnValue(of(null));
    dialog.open.mockReturnValue({
      afterClosed: () => of(false),
    });

    await component.onSubmit('test@example.com');

    expect(authFacade.createUser).not.toHaveBeenCalled();
    expect(authFacade.persistSession).not.toHaveBeenCalled();
    expect(component.loading$.value).toBe(false);
  });

  it('surfaces a readable error message when login fails', async () => {
    authFacade.findUserByEmail.mockReturnValue(throwError(() => new Error('API down')));

    await component.onSubmit('test@example.com');

    expect(component.errorMessage$.value).toBe('API down');
    expect(component.loading$.value).toBe(false);
  });
});
