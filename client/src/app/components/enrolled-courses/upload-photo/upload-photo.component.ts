import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { environment } from '../../../../environments/environment.development';
import { take } from 'rxjs';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { Payment, Photo } from '../../../models/helpers/enrolled-course.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { ManagerService } from '../../../services/manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-upload-photo',
    imports: [
        CommonModule, NgOptimizedImage, RouterModule,
        MatIconModule, FileUploadModule,
        MatButtonModule, MatCardModule, MatFormFieldModule
    ],
    templateUrl: './upload-photo.component.html',
    styleUrl: './upload-photo.component.scss'
})
export class UploadPhotoComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _accountService = inject(AccountService);
  private _managerService = inject(ManagerService);
  private snackBar = inject(MatSnackBar);

  apiUrl: string = environment.apiUrl;
  photoUrl: string = environment.apiPhotoUrl;

  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  loggedInUser: LoggedInUser | null | undefined;
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;
  payment: Payment | undefined;

  constructor() {
    this.loggedInUser = this._accountService.loggedInUserSig();
  }

  ngOnInit(): void {
    this.getTargetPayment();
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }

  getTargetPayment(): void {
    const targetPaymentId: string | null = this._route.snapshot.paramMap.get('targetPaymentId');

    if (targetPaymentId) {
      this._managerService.getTargetPayment(targetPaymentId)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.payment = response;
            this.initializeUploader();
          },
          error: (err) => {
            console.log('پرداخت مورد نظر پیدا نشد', err);
          },
        });
    }
  }

  fileOverBase(event: boolean): void {
    this.hasBaseDropZoneOver = event;
  }

  initializeUploader(): void {
    const targetPaymentId: string | null = this._route.snapshot.paramMap.get('targetPaymentId');

    this.uploader = new FileUploader({
      url: this.apiUrl + 'manager/add-photo/' + targetPaymentId,
      authToken: 'Bearer ' + this.loggedInUser?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 4_000_000, // bytes / 4MB
    });

    this.uploader.onAfterAddingFile = (file) => {

      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: Photo = JSON.parse(response);
        if (photo) {
          this.payment!.photo = photo;
        }
      }
    }
  }

  deletePhotoComp(url_165In: string): void {
    const targetPaymentId: string | null = this._route.snapshot.paramMap.get('targetPaymentId');

    this._managerService.deletePhoto(url_165In, targetPaymentId)
      .pipe(take(1))
      .subscribe({
        next: (response: ApiResponse) => {
          if (response && this.payment) {
            this.payment.photo = null;
            this.snackBar.open(response.message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 7000
            });
          }
        }
      });
  }
}