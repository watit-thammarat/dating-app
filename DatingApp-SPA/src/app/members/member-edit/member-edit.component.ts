import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { User } from '../../_models/user';
import { AlertifyService } from '../../_services/alertify.service';
import { UserService } from '../../_services/user.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm: NgForm;
  user: User;

  photoUrl: string;
  subscription: Subscription;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
    this.subscription = this.authService.currentPhotoUrl.subscribe(photoUrl => {
      this.photoUrl = photoUrl;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateUser() {
    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        _ => {
          this.alertify.success('Profile updated successfully');
          this.editForm.reset(this.user);
        },
        err => {
          this.alertify.error(err);
        }
      );
  }

  removePhoto(id: number) {
    this.user.photos = this.user.photos.filter(p => p.id !== id);
  }
}
