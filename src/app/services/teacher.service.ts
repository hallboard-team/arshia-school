import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoggedInUser } from '../models/logged-in-user.model';
import { RegisterUser } from '../models/register-user.model';
import { AddAttendence } from '../models/add-attendence.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly _http = inject(HttpClient);
  router = inject(Router);
  platformId = inject(PLATFORM_ID); 
  private snackBar = inject(MatSnackBar);

  private readonly _teaherApiUrl = environment.apiUrl + 'teacher/';

  loggedInUserSig = signal<LoggedInUser | null>(null);

  addAttendence(teacherInput: AddAttendence): Observable<ApiResponse | null> {
    return this._http.post<ApiResponse>(this._teaherApiUrl + 'add-attendence', teacherInput)
    .pipe(
      map(teacherResponse => {
        if (teacherResponse) {
          this.snackBar.open("add-attendence Done", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })
          
          return teacherResponse;
        }
        
        return null;
      })
    );
  }
}