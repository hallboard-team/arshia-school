import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { LoginUser } from '../models/login-user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { LoggedInUser } from '../models/logged-in-user.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  http = inject(HttpClient);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  snack = inject(MatSnackBar);

  private readonly baseApiUrl = environment.apiUrl + 'account/';

  loggedInUserSig = signal<LoggedInUser | null>(null);

  loginUser(userInput: LoginUser): Observable<LoggedInUser | null> {
    return this.http.post<LoggedInUser>(this.baseApiUrl + 'login', userInput).pipe(
      map(userResponse => {
        if (userResponse) {
          this.setCurrentUser(userResponse);
          this.navigateAfterLogin(userResponse);

          this.snack.open(`خوش آمدی ${userResponse.userName} !`, 'باشه', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snack-success'],
            direction: 'rtl'
          });

          return userResponse;
        }
        return null;
      })
    );
  }

  authorizeLoggedInUser(): void {
    this.http.get<ApiResponse>(this.baseApiUrl)
      .pipe(take(1))
      .subscribe({
        next: res => console.log(res.message),
        error: err => {
          console.log(err.error);
          this.logout();
        }
      });
  }

  setCurrentUser(loggedInUser: LoggedInUser): void {
    this.setLoggedInUserRoles(loggedInUser);
    this.loggedInUserSig.set(loggedInUser);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    }
  }

  setLoggedInUserRoles(loggedInUser: LoggedInUser): void {
    loggedInUser.roles = [];
    const roles: string | string[] = JSON.parse(atob(loggedInUser.token.split('.')[1])).role;
    Array.isArray(roles) ? loggedInUser.roles = roles : loggedInUser.roles.push(roles);
  }

  logout(): void {
    this.loggedInUserSig.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.router.navigateByUrl('/home');
    }

    this.snack.open('با موفقیت خارج شدی', 'باشه', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snack-info'],
      direction: 'rtl'
    });
  }

  private navigateAfterLogin(user: LoggedInUser): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const returnUrl = localStorage.getItem('returnUrl');
    if (returnUrl) {
      this.router.navigate([returnUrl]);
      localStorage.removeItem('returnUrl');
      return;
    }

    const target = this.getDefaultDashboardPath(user);
    this.router.navigate([target]);
  }

  private getDefaultDashboardPath(user: LoggedInUser): string {
    const roles = (user.roles || []).map(r => r?.toLowerCase());

    if (roles.includes('manager')) return '/manager-panel';
    if (roles.includes('teacher')) return '/teacher-panel';
    if (roles.includes('secretary')) return '/secretary-panel';
    // if (roles.includes('student')) return `/enrolled-course/${user.userName}`;

    return '/profile';
  }

  private navigateToReturnUrl(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const returnUrl = localStorage.getItem('returnUrl');
    if (returnUrl) {
      this.router.navigate([returnUrl]);
      localStorage.removeItem('returnUrl');
    } else {
      this.router.navigate(['home']);
    }
  }
}