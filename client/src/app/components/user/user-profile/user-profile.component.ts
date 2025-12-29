import { Component, OnInit, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AccountService } from '../../../services/account.service';
import { MemberService } from '../../../services/member.service';
import { ProfileInfoCardComponent } from '../../shared/profile-info-card/profile-info-card.component';
import { ProfileEditFormComponent } from '../../shared/profile-edit-form/profile-edit-form.component';
import { UpdatePassword } from '../../../models/password-update.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NavbarComponent, MatTabsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    ProfileInfoCardComponent, ProfileEditFormComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private _memberService = inject(MemberService);
  private _accountService = inject(AccountService);
  private _snackBar = inject(MatSnackBar);
  private _fb = inject(FormBuilder);
  private _router = inject(Router);

  loggedInUserSig = this._accountService.loggedInUserSig;
  profile: any = null;
  loading = true;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  memberEditFg: FormGroup = this._fb.group({
    currentPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20),
    Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*/]).*$/)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
  });

  get CurrentPasswordCtrl(): FormControl { return this.memberEditFg.get('currentPasswordCtrl') as FormControl; }
  get PasswordCtrl(): FormControl { return this.memberEditFg.get('passwordCtrl') as FormControl; }
  get ConfirmPasswordCtrl(): FormControl { return this.memberEditFg.get('confirmPasswordCtrl') as FormControl; }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    this.loading = true;
    this._memberService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onAvatarUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this._memberService.uploadProfilePhoto(file).subscribe({
      next: () => {
        this.getProfile();
        this._snackBar.open('عکس آپلود شد', 'باشه', { duration: 3000 });
      },
      error: () => this._snackBar.open('خطا در آپلود عکس', 'باشه')
    });
  }

  onProfileUpdate(updatedData: any) {
    this.loading = true;
    const updateDto = {
      ...updatedData,
      phoneNum: updatedData.phoneNum.startsWith('98') ? updatedData.phoneNum : '98' + updatedData.phoneNum
    };

    this._memberService.updateUser(updateDto).subscribe({
      next: (res) => {
        this._snackBar.open('پروفایل بروز شد', 'باشه', { duration: 4000 });
        this.getProfile();
      },
      error: (err) => {
        this.loading = false;
        this._snackBar.open(err.error || 'خطا در بروزرسانی', 'باشه');
      }
    });
  }

  updateMember(): void {
    if (this.memberEditFg.invalid) return;

    const updatePassword: UpdatePassword = {
      currentPassword: this.CurrentPasswordCtrl.value,
      newPassword: this.PasswordCtrl.value,
      confirmPassword: this.ConfirmPasswordCtrl.value
    };

    this._accountService.updatePassword(updatePassword)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this._accountService.logout();
          this._router.navigateByUrl('/account/login');
          this._snackBar.open('رمز عبور تغییر کرد. لطفاً مجدداً وارد شوید.', 'باشه', { duration: 5000 });
          this.memberEditFg.reset();
        },
        error: err => {
          const msg = err?.error ?? 'خطا در تغییر رمز عبور';
          this._snackBar.open(msg, 'بستن', { duration: 5000 });
        }
      });
  }

  cancelPasswordEdit(): void {
    this.memberEditFg.reset();
  }
}