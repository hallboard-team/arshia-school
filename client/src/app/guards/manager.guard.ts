import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';

export const managerGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const user = accountService.loggedInUserSig();

  if (user && (user.roles.includes('manager') || user.roles.includes('admin'))) {
    return true;
  }

  router.navigate(['/not-found']);
  return false;
};
