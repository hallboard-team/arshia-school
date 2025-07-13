import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoggedInUser } from '../models/logged-in-user.model';
import { RegisterUser } from '../models/register-user.model';

@Injectable({
  providedIn: 'root'
})
export class SecretaryService {
  private readonly _http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private readonly _managerapiUrl = environment.apiUrl + 'manager/';
  private readonly _secretaryapiUrl = environment.apiUrl + 'secretary/';
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  loggedInUserSig = signal<LoggedInUser | null>(null);

  addStudent(secretaryInput: RegisterUser): Observable<LoggedInUser | null> {
    return this._http.post<LoggedInUser>(this._secretaryapiUrl + 'add-student', secretaryInput).pipe(
      map(studentResponse => {
        if (studentResponse) {
          this.snackBar.open("دانش آموز با موفقیت ثبت شد", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

          return studentResponse;
        }

        return null;
      })
    );
  }
}