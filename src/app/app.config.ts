import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { UsersRepository } from './features/auth/domain/repositories/users.repository';
import { UserSessionRepository } from './features/auth/domain/repositories/user-session.repository';
import { HttpUsersRepository } from './features/auth/infrastructure/repositories/http-users.repository';
import { BrowserUserSessionRepository } from './features/auth/infrastructure/session/browser-user-session.repository';
import { TasksRepository } from './features/tasks/domain/repositories/tasks.repository';
import { HttpTasksRepository } from './features/tasks/infrastructure/repositories/http-tasks.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    { provide: UsersRepository, useExisting: HttpUsersRepository },
    { provide: UserSessionRepository, useExisting: BrowserUserSessionRepository },
    { provide: TasksRepository, useExisting: HttpTasksRepository },
  ],
};
