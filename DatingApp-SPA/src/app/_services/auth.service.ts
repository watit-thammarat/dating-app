import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = `${environment.apiUrl}/auth`;
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  constructor(private http: HttpClient) {}

  login(model: any) {
    return this.http.post<any>(`${this.baseUrl}/login`, model).pipe(
      map((res: any) => {
        const { token } = res;
        if (token) {
          localStorage.setItem('token', token);
          this.decodedToken = this.jwtHelper.decodeToken(token);
        }
      })
    );
  }

  register(model: any) {
    return this.http.post<any>(`${this.baseUrl}/register`, model);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }
}
