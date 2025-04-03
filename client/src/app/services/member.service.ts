import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { MemberParams } from '../models/helpers/member-params';
import { PaginatedResult } from '../models/helpers/paginatedResult';
import { map, Observable, of } from 'rxjs';
import { Member } from '../models/member.model';
import { PaginationHandler } from '../extensions/paginationHandler';
import { UserProfile } from '../models/user-profile.model';
import { LoggedInUser } from '../models/logged-in-user.model';
import { HashedUserId } from '../models/helpers/hashed-user-id.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterUser } from '../models/register-user.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { MemberUpdate } from '../models/member-update.model';
import { Course } from '../models/course.model';
import { AttendenceParams } from '../models/helpers/attendence-params';
import { Attendence } from '../models/attendence.model';
import { EnrolledCourse } from '../models/helpers/enrolled-course.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private _http = inject(HttpClient);
  router = inject(Router);

  private readonly _baseApiUrl = environment.apiUrl + 'member/';
  private readonly _apiUrl = environment.apiUrl + 'manager/';

  private snackBar = inject(MatSnackBar);
  private paginationHandler = new PaginationHandler();
  memberCache = new Map<string, PaginatedResult<Member[]>>();
  platformId = inject(PLATFORM_ID); 

  loggedInUserSig = signal<LoggedInUser | null>(null);

  getAllAttendence(attendenceParams: AttendenceParams, targetCourseTitle: string): Observable<PaginatedResult<Attendence[]>> {
    let params = new HttpParams();

    if (attendenceParams) {
      params = params.append('pageNumber', attendenceParams.pageNumber);
      params = params.append('pageSize', attendenceParams.pageSize);
    }

    return this.paginationHandler.getPaginatedResult<Attendence[]>(this._baseApiUrl + 'get-attendences/' + targetCourseTitle, params);
  }

  getAllMembers(memberParams: MemberParams): Observable<PaginatedResult<Member[]>> {
    const params = this.getHttpParams(memberParams);

    return this.paginationHandler.getPaginatedResult<Member[]>(this._apiUrl, params);
  }

  getProfile(): Observable<UserProfile | null> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this._http.get<UserProfile>(this._baseApiUrl + 'get-profile', { headers })
  }

  getCourses(): Observable<Course[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this._http.get<Course[]>(this._baseApiUrl + 'get-course', { headers });
  }
  
  updateUser(memberUpdate: MemberUpdate): Observable<ApiResponse> {
    return this._http.put<ApiResponse>(this._baseApiUrl, memberUpdate);
  }

  getEnrolledCourse(courseTitle: string):Observable<EnrolledCourse> {
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${localStorage.getItem('token')}`
    // });

    return this._http.get<EnrolledCourse>(this._baseApiUrl + 'get-enrolled-course/' + courseTitle);
  } 
  
  private getHttpParams(memberParams: MemberParams): HttpParams {
    let params = new HttpParams();

    if (memberParams) {
      params = params.append('search', memberParams.search);
      params = params.append('pageSize', memberParams.pageSize);
      params = params.append('pageNumber', memberParams.pageNumber);
      params = params.append('minAge', memberParams.minAge);
      params = params.append('maxAge', memberParams.maxAge);
    }

    return params;
  }
}