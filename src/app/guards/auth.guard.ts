import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const snackbar = inject(MatSnackBar);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const loggedInUserStr : string | null = localStorage.getItem('loggedInUser');

    // user is logged-in
    if (loggedInUserStr) {
      return true; // Open the component
    }

    //#region user is NOT logged-in
    snackbar.open('Please login first.', 'Close', {
      verticalPosition: 'top', // bottom
      horizontalPosition: 'center', // start, end
      duration: 7000
    });

    localStorage.setItem('returnUrl', state.url);

    router.navigate(['account/login'], { queryParams: { 'returnUrl': state.url } });
  }

  return false; // Block the component
  //#endregion
};