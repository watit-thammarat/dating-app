import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegiser = new EventEmitter<boolean>();

  model: any = {};

  constructor(
    private authServicr: AuthService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {}

  register(e) {
    e.preventDefault();
    this.authServicr.register(this.model).subscribe(
      _ => {
        console.log('registered ...');
        this.alertify.success('registration successfully');
      },
      err => {
        this.alertify.error(err);
      }
    );
  }

  cancel(e) {
    e.preventDefault();
    this.cancelRegiser.emit(false);
  }
}
