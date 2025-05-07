import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Input, PLATFORM_ID, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from 'express';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AddCorse } from '../models/add-corse.model';
import { ApiResponse } from '../models/helpers/apiResponse.model';
import { LoggedInUser } from '../models/logged-in-user.model';
import { Member } from '../models/member.model';
import { RegisterUser } from '../models/register-user.model';
import { UserWithRole } from '../models/user-with-role.model';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private _http = inject(HttpClient);
  private _apiUrl: string = environment.apiUrl + 'manager/';
  private snackBar = inject(MatSnackBar);

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

  // getUsersWithRoles(): Observable<UserWithRole[]> {
  //   return this.http.get<UserWithRole[]>(this.apiUrl + 'users-with-roles')
  // }

  // getUsersWithRole(followParams: FollowParams): Observable<PaginatedResult<Member[]>> {
  //   // 3
  //   let params = new HttpParams();

  //   if (followParams) {
  //     params = params.append('pageNumber', followParams.pageNumber);
  //     params = params.append('pageSize', followParams.pageSize);
  //     params = params.append('predicate', followParams.predicate);
  //   }

  //   // 4
  //   // Use this generic method and make it reusable for all components. 
  //   // console.log(followParams);
  //   return this.paginationHandler.getPaginatedResult<Member[]>(this._apiUrl, params);
  // }

  // delete(memberUserName: string): Observable<ApiResponse> {
  //   return this.http.delete<ApiResponse>(this.apiUrl + 'deleteMember/' + memberUserName);
  // }

  // addCorse(managerInput: AddCorse): Observable<ApiResponse | null> {
  //   return this.http.post<ApiResponse>(this.apiUrl + 'add-corse', managerInput)
  //   .pipe(
  //     map(managerResponse => {
  //       if (managerResponse) {
  //         this.snackBar.open("add-corse Done", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })
          
  //         return managerResponse;
  //       }
        
  //       return null;
  //     })
  //   );
  // }
}