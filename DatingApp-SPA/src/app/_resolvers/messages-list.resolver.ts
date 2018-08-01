import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { AuthService } from '../_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesResolver implements Resolve<PaginatedResult<Message[]>> {
  private pageNumber = 1;
  private pageSize = 5;
  private messageContainer = 'Unread';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private alertifyService: AlertifyService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<PaginatedResult<Message[]>> {
    const userId = this.authService.decodedToken.nameid;
    return this.userService
      .getMessages(
        userId,
        this.pageNumber,
        this.pageSize,
        this.messageContainer
      )
      .pipe(
        catchError(err => {
          this.alertifyService.error('Problem retrieving data');
          this.router.navigate(['/home']);
          return of(null);
        })
      );
  }
}
