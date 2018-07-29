import { AuthService } from './../_services/auth.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegiser = new EventEmitter<boolean>();

  model: any = {};

  constructor(private authServicr: AuthService) {}

  ngOnInit() {}

  register(e) {
    e.preventDefault();
    this.authServicr.register(this.model).subscribe(
      _ => {
        console.log('registered ...');
      },
      err => {
        console.log(err);
      }
    );
  }

  cancel(e) {
    e.preventDefault();
    this.cancelRegiser.emit(false);
  }
}
