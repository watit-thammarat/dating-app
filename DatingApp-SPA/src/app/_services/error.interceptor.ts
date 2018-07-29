import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            return throwError(err.statusText);
          }
          const appError = err.headers.get('Application-Error');
          if (appError) {
            return throwError(appError);
          }
          const serverErr = err.error;
          let modalStateErr = '';
          if (serverErr && typeof serverErr === 'object') {
            for (const key in serverErr) {
              if (serverErr[key]) {
                modalStateErr += serverErr[key] + '\n';
              }
            }
          }
          return throwError(modalStateErr || serverErr || 'Server Error');
        }
      })
    );
  }
}

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true
};
