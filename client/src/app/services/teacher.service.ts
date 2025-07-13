import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoggedInUser } from '../models/logged-in-user.model';
import { AddAttendence } from '../models/add-attendence.model';
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
  private snackBar = inject(MatSnackBar);
  private readonly _teaherApiUrl = environment.apiUrl + 'teacher/';
  private paginationHandler = new PaginationHandler();
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

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

    return this.paginationHandler.getPaginatedResult<Member[]>(this._teaherApiUrl + 'get-student/' + targetTitle, params);
  }

  addAttendence(attendanceData: { userName: string, isAbsent: boolean }, targetCourseTitle: string) {
    return this._http.post<AddAttendence>(this._teaherApiUrl + 'add-attendence/' + targetCourseTitle, attendanceData);
  }

  deleteAttendence(targetUserName: string, targetCourseTitle: string): Observable<any> {
    return this._http.delete(this._teaherApiUrl + 'remove-attendence/' + targetUserName + '/' + targetCourseTitle);
  }
}