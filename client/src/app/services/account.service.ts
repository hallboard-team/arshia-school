import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { LoginUser } from '../models/login-user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { LoggedInUser } from '../models/logged-in-user.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  //#region injects and variables
  http = inject(HttpClient);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  private readonly baseApiUrl = environment.apiUrl + 'account/';

  loggedInUserSig = signal<LoggedInUser | null>(null);

  //#endregion injects and variables

  // #region methods
  loginUser(userInput: LoginUser): Observable<LoggedInUser | null> {
    return this.http.post<LoggedInUser>(this.baseApiUrl + 'login', userInput).pipe(
      map(userResponse => {
        if (userResponse) {
          this.setCurrentUser(userResponse);

          this.navigateToReturnUrl();

          return userResponse;
        }

        return null;
      })
    );
  }

  authorizeLoggedInUser(): void {
    this.http.get<ApiResponse>(this.baseApiUrl)
      .pipe(
        take(1))
      .subscribe({
        next: res => console.log(res.message),
        error: err => {
          console.log(err.error);
          this.logout()
        }
      });
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

  logout(): void {
    this.loggedInUserSig.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();

      this.router.navigateByUrl('/home');
    }
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
  //#endregion methods
}
