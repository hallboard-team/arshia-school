import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { LoggedInUser } from '../models/logged-in-user.model';
import { Member } from '../models/member.model';
import { RegisterUser } from '../models/register-user.model';
import { Teacher } from '../models/teacher.model';
import { ManagerUpdateMemberDto } from '../models/manager-update-member.model';
import { AddEnrolledCourse } from '../models/add-enrolled-course.model';
import { UpdateEnrolledCourse } from '../models/update-enrolled-course.model';
import { TargetUserProfile } from '../models/target-user-profile.model';
import { Course } from '../models/course.model';
import { EnrolledCourse, Payment } from '../models/helpers/enrolled-course.model';
import { AttendenceParams } from '../models/helpers/attendence-params';
import { Attendence } from '../models/attendence.model';
import { PaginatedResult } from '../models/helpers/paginatedResult';
import { PaginationHandler } from '../extensions/paginationHandler';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private _http = inject(HttpClient);
  private _apiUrl: string = environment.apiUrl + 'manager/';
  private snackBar = inject(MatSnackBar);
  private paginationHandler = new PaginationHandler();

  createTeacher(managerInput: RegisterUser): Observable<LoggedInUser | null> {
    return this._http.post<LoggedInUser>(this._apiUrl + 'create-teacher', managerInput).pipe(
      map(teacherResponse => {
        if (teacherResponse) {
          this.snackBar.open("معلم با موفقیت ثبت شد", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

          return teacherResponse;
        }

        return null;
      })
    );
  }

  createSecretary(managerInput: RegisterUser): Observable<LoggedInUser | null> {
    return this._http.post<LoggedInUser>(this._apiUrl + 'create-secretary', managerInput).pipe(
      map(secretaryResponse => {
        if (secretaryResponse) {
          this.snackBar.open("منشی با موفقیت ثبت شد", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

          return secretaryResponse;
        }

        return null;
      })
    );
  }

  createStudent(managerInput: RegisterUser): Observable<LoggedInUser | null> {
    return this._http.post<LoggedInUser>(this._apiUrl + 'create-student', managerInput).pipe(
      map(secretaryResponse => {
        if (secretaryResponse) {
          this.snackBar.open("دانش آموز با موفقیت ثبت شد", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

          return secretaryResponse;
        }

        return null;
      })
    );
  }

  getTeachers(): Observable<Teacher[]> {
    return this._http.get<Teacher[]>(this._apiUrl + 'teachers');
  }

  getMemberByEmail(targetMemberEmail: string): Observable<Member> {
    return this._http.get<Member>(this._apiUrl + 'get-target-member/' + targetMemberEmail)
  }

  getMemberByUserName(targetMemberUserName: string | null): Observable<TargetUserProfile> {
    return this._http.get<TargetUserProfile>(this._apiUrl + 'get-member-by-userName/' + targetMemberUserName)
  }

  getTargetUserCourses(targetMemberUserName: string | null): Observable<Course[] | null> {
    return this._http.get<Course[]>(this._apiUrl + 'get-target-member-course/' + targetMemberUserName)
  }

  getTargetCourseTitles(targetMemberUserName: string | null): Observable<string[] | null> {
    return this._http.get<string[]>(this._apiUrl + 'get-target-courseTitle/' + targetMemberUserName)
  }

  getTargetUserEnrolledCourse(targetMemberUserName: string | null, courseTitle: string): Observable<EnrolledCourse> {
    return this._http.get<EnrolledCourse>(this._apiUrl + 'get-target-member-enrolled-course/' + targetMemberUserName + '/' + courseTitle);
  }

  getTargetUserAttendence(attendenceParams: AttendenceParams, targetUserName: string, targetCourseTitle: string): Observable<PaginatedResult<Attendence[]>> {
    let params = new HttpParams();

    if (attendenceParams?.pageNumber)
      params = params.append('pageNumber', attendenceParams.pageNumber);
    if (attendenceParams?.pageSize)
      params = params.append('pageSize', attendenceParams.pageSize);

    return this.paginationHandler.getPaginatedResult<Attendence[]>(
      `${this._apiUrl}get-target-member-attendences/${targetUserName}/${targetCourseTitle}`,
      params
    );
  }

  getTargetPayment(targetPaymentId: string | null): Observable<Payment> {
    return this._http.get<Payment>(this._apiUrl + 'get-target-payment-by-id/' + targetPaymentId);
  }

  updateMember(managerUpdateInput: ManagerUpdateMemberDto, targetMemberEmail: string): Observable<any> {
    return this._http.put(this._apiUrl + 'update-member/' + targetMemberEmail, managerUpdateInput)
  }

  addEnrolledCourse(targetUserName: string, addEnrolledCourse: AddEnrolledCourse) {
    return this._http.post(this._apiUrl + 'add-enrolledCourse/' + targetUserName, addEnrolledCourse)
  }

  updateEnrolledCourse(targetUserName: string, updateEnrolledCourse: UpdateEnrolledCourse) {
    return this._http.put(this._apiUrl + 'update-enrolledCourse/' + targetUserName, updateEnrolledCourse)
  }

  deletePhoto(url_165: string, paymentId: string | null): Observable<ApiResponse> {
    return this._http.delete<ApiResponse>(
      `${this._apiUrl}delete-photo/${paymentId}?photoUrlIn=${url_165}`
    );
  }
}