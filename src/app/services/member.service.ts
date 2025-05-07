import { HttpClient, HttpParams } from '@angular/common/http';
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

  // Observable / Promise
  getAll(memberParams: MemberParams): Observable<PaginatedResult<Member[]>> {
    let params = new HttpParams();

    if (memberParams) {
      params = params.append('pageNumber', memberParams.pageNumber);
      params = params.append('pageSize', memberParams.pageSize);
    }

    return this.paginationHandler.getPaginatedResult<Member[]>(this._baseApiUrl, params);
  }

  getProfile(hashedUserId: HashedUserId): Observable<UserProfile | null> {
    return this._http.get<UserProfile>(this._baseApiUrl + 'get-profile')
  }

  getByUserName(userName: string): Observable<Member | null> {
    return this._http.get<Member>(this._baseApiUrl + 'get-by-userName/' + userName);
  }

  updateUser(memberUpdate: MemberUpdate): Observable<ApiResponse> {
    return this._http.put<ApiResponse>(this._baseApiUrl, memberUpdate);
  }
}