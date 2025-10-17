import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, finalize, map, take } from 'rxjs';
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
  private readonly LS_KEY = 'loggedInUser';

  loggedInUserSig = signal<LoggedInUser | null>(null);
  authResolvedSig = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.LS_KEY);
      if (raw) {
        try {
          const user = JSON.parse(raw) as LoggedInUser;
          this.setLoggedInUserRoles(user);
          this.loggedInUserSig.set(user);
        } catch { }
      }
    }
    this.authResolvedSig.set(true);
  }

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
    this.authResolvedSig.set(false);

    this.http.get<ApiResponse>(this.baseApiUrl)
      .pipe(
        take(1),
        finalize(() => {
          this.authResolvedSig.set(true);
        })
      )
      .subscribe({
        next: res => console.log(res.message),
        error: err => {
          console.log(err?.error);
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
    try {
      const payload = JSON.parse(atob(loggedInUser.token.split('.')[1]));
      const roles: string | string[] = payload.role;
      Array.isArray(roles) ? (loggedInUser.roles = roles) : loggedInUser.roles.push(roles);
    } catch {
    }
  }

  logout(): void {
    this.loggedInUserSig.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.LS_KEY);
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