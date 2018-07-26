import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  login(model: any) {
    return this.http.post<any>(`${this.baseUrl}/login`, model).pipe(
      map((res: any) => {
        const { token } = res;
        if (token) {
          localStorage.setItem('token', token);
        }
      })
    );
  }

  register(model: any) {
    return this.http.post<any>(`${this.baseUrl}/register`, model);
  }
}
