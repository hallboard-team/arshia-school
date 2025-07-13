import { inject, Injectable } from '@angular/core';
import { CourseParams } from '../models/helpers/course-params';
import { AddCourse, Course, CourseUpdate, ShowCourse } from '../models/course.model';
import { PaginatedResult } from '../models/helpers/paginatedResult';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginationHandler } from '../extensions/paginationHandler';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private _http = inject(HttpClient);
  private readonly _baseApiUrl = environment.apiUrl + 'course/';
  private paginationHandler = new PaginationHandler();

  getAll(courseParams: CourseParams): Observable<PaginatedResult<ShowCourse[]>> {
    let params = new HttpParams();

    if (courseParams) {
      params = params.append('pageNumber', courseParams.pageNumber);
      params = params.append('pageSize', courseParams.pageSize);
    }

    return this.paginationHandler.getPaginatedResult<ShowCourse[]>(this._baseApiUrl + 'get-all-courses', params);
  }

  addCourse(addCourse: AddCourse): Observable<ShowCourse> {
    return this._http.post<ShowCourse>(this._baseApiUrl + 'add', addCourse)
  }

  update(courseUpdate: Partial<CourseUpdate>, targetTitelCourse: string) {
    return this._http.put<Course>(this._baseApiUrl + 'update/' + targetTitelCourse, courseUpdate);
  }

  getByTitle(courseTitle: string): Observable<Course> {
    return this._http.get<Course>(this._baseApiUrl + 'get-targetCourse/' + courseTitle);
  }

  addProfessorToCourse(targetCourseTitle: string, professorUserName: string): Observable<any> {
    return this._http.post(this._baseApiUrl + 'add-professor/' + targetCourseTitle + '/' + professorUserName, null);
  }

  removeProfessorFromCourse(targetCourseTitle: string, professorUserName: string): Observable<any> {
    return this._http.delete(this._baseApiUrl + 'remove-professor/' + targetCourseTitle + '/' + professorUserName);
  }
}