import { inject, Injectable } from '@angular/core';
import { SiteParams } from '../models/helpers/application-params';
import { AddSite, ShowSite, Site, SiteUpdate } from '../models/site.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginationHandler } from '../extensions/paginationHandler';
import { PaginatedResult } from '../models/helpers/paginatedResult';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  private _http = inject(HttpClient);
  private readonly _baseApiUrl = environment.apiUrl + 'site/';
  private paginationHandler = new PaginationHandler();

  getAll(siteParams: SiteParams): Observable<PaginatedResult<ShowSite[]>> {
    let params = new HttpParams();

    if (siteParams) {
      params = params.append('pageNumber', siteParams.pageNumber);
      params = params.append('pageSize', siteParams.pageSize);
    }

    return this.paginationHandler.getPaginatedResult<ShowSite[]>(this._baseApiUrl, params);
  }

  getSiteByName(siteName: string): Observable<ShowSite> {
    return this._http.get<ShowSite>(this._baseApiUrl + 'get-site/' + siteName);
  }

  addSite(addSite: AddSite): Observable<ShowSite> {
    return this._http.post<ShowSite>(this._baseApiUrl + 'create-site', addSite)
  }

  update(siteUpdate: Partial<SiteUpdate>, targetSiteName: string) {
    return this._http.put<Site>(this._baseApiUrl + 'update-site/' + targetSiteName, siteUpdate);
  }

  delete(siteName: string): Observable<any> {
    return this._http.delete(this._baseApiUrl + 'delete-site/' + siteName);
  }
}