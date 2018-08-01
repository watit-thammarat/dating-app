import { Component, OnInit, Input } from '@angular/core';
import { tap } from 'rxjs/operators';

import { Message } from '../../_models/message';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;

  messages: Message[];
  newMessage: any = {};

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const userId = +this.authService.decodedToken.nameid;
    this.userService
      .getMessageThead(userId, this.recipientId)
      .pipe(
        tap(messages => {
          for (const m of messages) {
            if (!m.isRead && m.recipientId === userId) {
              this.userService.markAsRead(userId, m.id);
            }
          }
        })
      )
      .subscribe(
        data => {
          this.messages = data;
        },
        err => {
          this.alertifyService.error(err);
        }
      );
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    const userId = this.authService.decodedToken.nameid;
    this.userService.sendMessage(userId, this.newMessage).subscribe(
      message => {
        this.messages.unshift(message);
        this.newMessage.content = '';
      },
      err => {
        this.alertifyService.error(err);
      }
    );
  }
}
