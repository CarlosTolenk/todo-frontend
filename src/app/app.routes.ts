import { Routes } from '@angular/router';

import { sessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'tasks',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./features/tasks/pages/tasks-page/tasks-page.component').then(
        (m) => m.TasksPageComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
