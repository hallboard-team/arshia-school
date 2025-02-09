import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoggedInUser } from '../models/logged-in-user.model';
import { RegisterUser } from '../models/register-user.model';
import { AddAttendence, AddAttendenceDemo } from '../models/add-attendence.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { Course } from '../models/course.model';
import { Member } from '../models/member.model';
import { MemberParams } from '../models/helpers/member-params';
import { PaginatedResult } from '../models/helpers/paginatedResult';
import { PaginationHandler } from '../extensions/paginationHandler';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly _http = inject(HttpClient);
  router = inject(Router);
  platformId = inject(PLATFORM_ID); 
  private snackBar = inject(MatSnackBar);

  private readonly _teaherApiUrl = environment.apiUrl + 'teacher/';
  private paginationHandler = new PaginationHandler();

  loggedInUserSig = signal<LoggedInUser | null>(null);

  getCourse(): Observable<Course[]> {
    return this._http.get<Course[]>(this._teaherApiUrl + 'get-course');
  }

  getStudents(memberParams: MemberParams, targetTitle: string): Observable<PaginatedResult<Member[]>> {
    let params = new HttpParams();

    if (memberParams) {
      params = params.append('pageNumber', memberParams.pageNumber);
      params = params.append('pageSize', memberParams.pageSize);
    }

    // Use this generic method and make it reusable for all components.
    return this.paginationHandler.getPaginatedResult<Member[]>(this._teaherApiUrl + 'get-student/' + targetTitle, params);
  }

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

  addAttendenceDemo(teacherInput: AddAttendenceDemo): Observable<ApiResponse | null> {
    return this._http.post<ApiResponse>(this._teaherApiUrl + 'add-attendence-demo', teacherInput)
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