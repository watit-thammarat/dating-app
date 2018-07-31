import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    pageNumber?: number,
    pageSize?: number,
    userParams?: any
  ): Observable<PaginatedResult<User[]>> {
    const data = new PaginatedResult<User[]>();
    let params = new HttpParams();
    if (pageNumber != null) {
      params = params.append('pageNumber', pageNumber.toString());
    }
    if (pageSize != null) {
      params = params.append('pageSize', pageSize.toString());
    }
    if (userParams) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }
    return this.http
      .get<User[]>(this.baseUrl, { observe: 'response', params })
      .pipe(
        map(res => {
          data.result = res.body;
          if (res.headers.get('Pagination')) {
            data.pagination = JSON.parse(res.headers.get('Pagination'));
          }
          return data;
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: number, user: User) {
    return this.http.put(`${this.baseUrl}/${id}`, user);
  }

  setMainPhoto(userId: number, id: number) {
    return this.http.post(`${this.baseUrl}/${userId}/photos/${id}/setMain`, {});
  }

  deletePhoto(userId: number, id: number) {
    return this.http.delete(`${this.baseUrl}/${userId}/photos/${id}`);
  }
}
