import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivateFn, Router } from '@angular/router';

export const authLoggedInGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {

    if (localStorage.getItem('loggedInUser')) {

      router.navigate(['home']);

      snackbar.open('شما قبلاً وارد شده‌اید', 'باشه', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snack-info'],
        direction: 'rtl'
      });

      return false; // Block the component
    }
  }

  return true; // Open the component
};