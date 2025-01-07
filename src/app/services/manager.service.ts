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
  private http = inject(HttpClient);
  private apiUrl: string = environment.apiUrl + 'manager/';
  private snackBar = inject(MatSnackBar);

  getUsersWithRoles(): Observable<UserWithRole[]> {
    return this.http.get<UserWithRole[]>(this.apiUrl + 'users-with-roles')
  }

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

  delete(memberUserName: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(this.apiUrl + 'deleteMember/' + memberUserName);
  }

  addCorse(managerInput: AddCorse): Observable<ApiResponse | null> {
    return this.http.post<ApiResponse>(this.apiUrl + 'add-corse', managerInput)
    .pipe(
      map(managerResponse => {
        if (managerResponse) {
          this.snackBar.open("add-corse Done", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })
          
          return managerResponse;
        }
        
        return null;
      })
    );
  }
}