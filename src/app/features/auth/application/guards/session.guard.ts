import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthFacade } from '../facades/auth.facade';

export const sessionGuard: CanActivateFn = () => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.getCurrentUser() ? true : router.createUrlTree(['/login']);
};
