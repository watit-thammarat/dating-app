import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { Router } from '@angular/router';

import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegiser = new EventEmitter<boolean>();

  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    // this.registerForm = new FormGroup(
    //   {
    //     username: new FormControl('', [Validators.required]),
    //     password: new FormControl('', [
    //       Validators.required,
    //       Validators.minLength(4),
    //       Validators.maxLength(8)
    //     ]),
    //     confirmPassword: new FormControl('', [Validators.required])
    //   },
    //   this.passwordMatchValidator
    // );
    this.bsConfig = {
      containerClass: 'theme-red'
    };
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        gender: ['male'],
        knownAs: ['', [Validators.required]],
        dateOfBirth: [null, [Validators.required]],
        city: ['', [Validators.required]],
        country: ['', [Validators.required]],
        username: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(8)
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validator: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null
      : { mismatch: true };
  }

  register(e) {
    e.preventDefault();
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe(
        _ => {
          this.authService.login(this.registerForm.value).subscribe(
            () => {
              this.router.navigate(['/members']);
            },
            err => {
              this.alertify.error(err);
            }
          );
          this.alertify.success('registration successfully');
        },
        err => {
          this.alertify.error(err);
        }
      );
    }
  }

  cancel(e) {
    e.preventDefault();
    this.cancelRegiser.emit(false);
  }
}
