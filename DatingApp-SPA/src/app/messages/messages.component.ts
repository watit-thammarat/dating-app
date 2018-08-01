import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    const userId = this.authService.decodedToken.nameid;
    const { itemsPerPage, currentPage } = this.pagination;
    this.userService
      .getMessages(userId, currentPage, itemsPerPage, this.messageContainer)
      .subscribe(
        data => {
          this.messages = data.result;
          this.pagination = data.pagination;
        },
        err => {
          this.alertifyService.error(err);
        }
      );
  }

  deleteMesage(id: number, e) {
    e.stopPropagation();
    const userId = this.authService.decodedToken.nameid;
    this.alertifyService.confirm(
      'Are you sure you want to delete this message?',
      () => {
        this.userService.deleteMessage(userId, id).subscribe(
          _ => {
            this.messages = this.messages.filter(m => m.id !== id);
            this.alertifyService.success('Message has been deleted');
          },
          err => {
            this.alertifyService.error('Failed to delete the message');
          }
        );
      }
    );
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }
}
