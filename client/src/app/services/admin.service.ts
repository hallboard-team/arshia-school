import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { RegisterUser } from '../models/register-user.model';
import { Observable, map } from 'rxjs';
import { LoggedInUser } from '../models/logged-in-user.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  http = inject(HttpClient);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);

  private readonly baseApiUrl = environment.apiUrl + 'admin/';

  loggedInUserSig = signal<LoggedInUser | null>(null);

  addManager(adminInput: RegisterUser): Observable<LoggedInUser | null> {
    return this.http.post<LoggedInUser>(this.baseApiUrl + 'add-manager', adminInput).pipe(
      map(adminResponse => {
        if (adminResponse) {
          this.snackBar.open("مدیر با موفقیت ثبت شد", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

          this.setCurrentUser(adminResponse);

          this.navigateToReturnUrl();

          return adminResponse;
        }

        return null;
      })
    );
  }

  setCurrentUser(loggedInUser: LoggedInUser): void {
    this.setLoggedInUserRoles(loggedInUser);

    this.loggedInUserSig.set(loggedInUser);

    if (isPlatformBrowser(this.platformId))
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  }

  setLoggedInUserRoles(loggedInUser: LoggedInUser): void {
    loggedInUser.roles = [];

    const roles: string | string[] = JSON.parse(atob(loggedInUser.token.split('.')[1])).role;

    Array.isArray(roles) ? loggedInUser.roles = roles : loggedInUser.roles.push(roles);
  }

  private navigateToReturnUrl(): void {
    if (isPlatformBrowser(this.platformId)) {
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl)
        this.router.navigate([returnUrl]);
      else
        this.router.navigate(['home']);

      if (isPlatformBrowser(this.platformId))
        localStorage.removeItem('returnUrl');
    }
  }
}
