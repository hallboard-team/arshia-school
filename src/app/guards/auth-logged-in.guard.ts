import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanActivateFn, Router } from '@angular/router';

export const authLoggedInGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);
  const platformId = inject(PLATFORM_ID);

  //#region user is logged-in
  if (isPlatformBrowser(platformId)) {
    
    if (localStorage.getItem('loggedInUser')) {
      
      router.navigate(['home']);
      // router.navigate(['members'], {queryParams: { 'returnUrl': state.url }});

      snackbar.open('You are already logged in', 'Close', { horizontalPosition: 'center', duration: 7000 })

      // localStorage.setItem('returnUrl', state.url);

      return false; // Block the component
    }
  }
  //#endregion

  // user is NOT logged-in
  return true; // Open the component
};