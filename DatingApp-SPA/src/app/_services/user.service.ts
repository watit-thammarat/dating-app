import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/user';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    pageNumber?: number,
    pageSize?: number,
    userParams?: any,
    likesParam?: string
  ): Observable<PaginatedResult<User[]>> {
    const data = new PaginatedResult<User[]>();
    let params = new HttpParams();
    if (pageNumber !== null) {
      params = params.append('pageNumber', pageNumber.toString());
    }
    if (pageSize !== null) {
      params = params.append('pageSize', pageSize.toString());
    }
    if (userParams) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }
    if (likesParam === 'likers') {
      params = params.append('likers', 'true');
    }
    if (likesParam === 'likees') {
      params = params.append('likees', 'true');
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

  sendLike(id: number, recipient: number) {
    return this.http.post(`${this.baseUrl}/${id}/like/${recipient}`, {});
  }

  getMessageThead(id: number, recipientId: number) {
    const url = `${this.baseUrl}/${id}/messages/thread/${recipientId}`;
    return this.http.get<Message[]>(url);
  }

  getMessages(
    id: number,
    pageNumber?: number,
    pageSize?: number,
    messageContainr?: string
  ) {
    const data = new PaginatedResult<Message[]>();
    let params = new HttpParams();
    if (pageNumber !== null) {
      params = params.append('pageNumber', pageNumber.toString());
    }
    if (pageSize !== null) {
      params = params.append('pageSize', pageSize.toString());
    }
    if (messageContainr !== null) {
      params = params.append('messageContainer', messageContainr);
    }
    const url = `${this.baseUrl}/${id}/messages`;
    return this.http.get<Message[]>(url, { observe: 'response', params }).pipe(
      map(res => {
        data.result = res.body;
        if (res.headers.get('Pagination')) {
          data.pagination = JSON.parse(res.headers.get('Pagination'));
        }
        return data;
      })
    );
  }

  sendMessage(id: number, message: Message) {
    const url = `${this.baseUrl}/${id}/messages`;
    return this.http.post<Message>(url, message);
  }

  deleteMessage(userId: number, id: number) {
    const url = `${this.baseUrl}/${userId}/messages/${id}`;
    return this.http.post(url, {});
  }

  markAsRead(userId: number, id: number) {
    const url = `${this.baseUrl}/${userId}/messages/${id}/read`;
    return this.http.post(url, {}).subscribe();
  }
}
