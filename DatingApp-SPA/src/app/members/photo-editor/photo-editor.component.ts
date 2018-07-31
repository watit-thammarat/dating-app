import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

import { environment } from '../../../environments/environment';
import { Photo } from '../../_models/photo';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() removePhoto = new EventEmitter<number>();

  baseUrl = `${environment.apiUrl}/users`;
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  currentMain: Photo;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: `${this.baseUrl}/${this.authService.decodedToken.nameid}/photos`,
      authToken: `Bearer ${localStorage.getItem('token')}`,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });
    this.uploader.onAfterAddingFile = f => {
      f.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const { id, url, description, dateAdded, isMain }: Photo = JSON.parse(
          response
        );
        const photo = {
          id,
          url,
          dateAdded,
          description,
          isMain
        };
        this.photos.push(photo);
        if (isMain) {
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem(
            'user',
            JSON.stringify(this.authService.currentUser)
          );
          this.authService.changeMemberPhoto(photo.url);
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService
      .setMainPhoto(this.authService.decodedToken.nameid, photo.id)
      .subscribe(
        _ => {
          this.currentMain = this.photos.find(p => p.isMain);
          this.currentMain.isMain = false;
          photo.isMain = true;
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem(
            'user',
            JSON.stringify(this.authService.currentUser)
          );
          this.authService.changeMemberPhoto(photo.url);
        },
        err => {
          this.alertify.error(err);
        }
      );
  }

  deletePhoto(photo: Photo) {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService
        .deletePhoto(this.authService.decodedToken.nameid, photo.id)
        .subscribe(
          _ => {
            this.removePhoto.emit(photo.id);
            this.alertify.success('Photo has been deleted');
          },
          err => {
            this.alertify.error(err);
          }
        );
    });
  }
}
