import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginationHandler } from '../extensions/paginationHandler';
import { ClassParams } from '../models/helpers/application-params';
import { PaginatedResult } from '../models/helpers/paginatedResult';
import { ShowClass, AddClass, ClassUpdate } from '../models/class.model';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private _http = inject(HttpClient);
  private readonly _baseApiUrl = environment.apiUrl + 'ClassRoom/'; 
  private paginationHandler = new PaginationHandler();

  getAll(classParams: ClassParams): Observable<PaginatedResult<ShowClass[]>> {
    let params = new HttpParams();

    if (classParams) {
      params = params.append('pageNumber', classParams.pageNumber);
      params = params.append('pageSize', classParams.pageSize);
    }

    return this.paginationHandler.getPaginatedResult<ShowClass[]>(
      this._baseApiUrl + 'get-all-class-rooms', 
      params
    );
  }

  getClassByName(classRoomName: string): Observable<ShowClass> {
    return this._http.get<ShowClass>(this._baseApiUrl + 'get-target-class-room/' + classRoomName);
  }

  addClass(addClass: AddClass): Observable<ShowClass> {
    return this._http.post<ShowClass>(this._baseApiUrl + 'create-class-room', addClass);
  }

  update(classUpdate: ClassUpdate, targetClassRoomName: string): Observable<ShowClass> {
    return this._http.put<ShowClass>(
      this._baseApiUrl + 'update-class-room/' + targetClassRoomName, 
      classUpdate
    );
  }

  addProfessor(classRoomTitle: string, professorUserName: string): Observable<any> {
    return this._http.put(
      `${this._baseApiUrl}add-professor/${classRoomTitle}/${professorUserName}`, 
      {}
    );
  }

  removeProfessor(classRoomTitle: string, professorUserName: string): Observable<any> {
    return this._http.put(
      `${this._baseApiUrl}remove-professor/${classRoomTitle}/${professorUserName}`, 
      {}
    );
  }
}