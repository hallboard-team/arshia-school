import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfile } from '../../../models/user-profile.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { Course } from '../../../models/course.model';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { MemberService } from '../../../services/member.service';
import { CourseParams } from '../../../models/helpers/course-params';
import { CourseService } from '../../../services/course.service';
import { Pagination } from '../../../models/helpers/pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MemberUpdate } from '../../../models/member-update.model';
import { take } from 'rxjs';
import moment, { Moment } from 'moment-jalaali';
import { UpdatePassword } from '../../../models/password-update.model';
import { DatepickerComponent } from '../../../datepicker/datepicker.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, NavbarComponent, RouterModule,
    MatTabsModule, MatSnackBarModule, DatepickerComponent,
    MatSelectModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private readonly _accountService = inject(AccountService);
  private readonly _memberService = inject(MemberService);
  private readonly _courseService = inject(CourseService);
  private readonly _matSnackBar = inject(MatSnackBar);
  private readonly _fb = inject(FormBuilder);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  profile: UserProfile | null = null;
  courses: Course[] | null = [];
  shamsiCourses: (Course & { shamsiStart: string })[] = [];

  loading = true;
  error: string | null = null;

  courseParams: CourseParams | undefined = new CourseParams();
  pagination: Pagination | undefined;
  courseLoaded = false;

  profileEditMode = false;

  minDob: Moment = moment().subtract(100, 'jYear').startOf('day');
  maxDob: Moment = moment().subtract(5, 'jYear').endOf('day');

  profileFg: FormGroup = this._fb.group({
    emailCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    nameCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(30)]],
    lastNameCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(30)]],
    phoneNumCtrl: [{ value: '', disabled: true }, [Validators.maxLength(20)]],
    userNameCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(30)]],
    genderCtrl: [{ value: '', disabled: true }, Validators.required],
    dateOfBirthCtrl: [{ value: null, disabled: true }, [Validators.required]]
  });

  memberEditFg: FormGroup = this._fb.group({
    currentPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
  });

  // Getters: profile tab
  get EmailCtrl(): FormControl { return this.profileFg.get('emailCtrl') as FormControl; }
  get NameCtrl(): FormControl { return this.profileFg.get('nameCtrl') as FormControl; }
  get LastNameCtrl(): FormControl { return this.profileFg.get('lastNameCtrl') as FormControl; }
  get PhoneNumCtrl(): FormControl { return this.profileFg.get('phoneNumCtrl') as FormControl; }
  get UserNameCtrl(): FormControl { return this.profileFg.get('userNameCtrl') as FormControl; }
  get GenderCtrl(): FormControl { return this.profileFg.get('genderCtrl') as FormControl; }
  get DateOfBirthCtrl(): FormControl { return this.profileFg.get('dateOfBirthCtrl') as FormControl; }

  // Getters: password tab
  get CurrentPasswordCtrl(): FormControl { return this.memberEditFg.get('currentPasswordCtrl') as FormControl; }
  get PasswordCtrl(): FormControl { return this.memberEditFg.get('passwordCtrl') as FormControl; }
  get ConfirmPasswordCtrl(): FormControl { return this.memberEditFg.get('confirmPasswordCtrl') as FormControl; }

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
    this.getProfile();
  }

  // ───── API calls

  /** GET /member/get-profile */
  private getProfile(): void {
    this._memberService.getProfile().subscribe({
      next: data => {
        if (data) {
          const dobStr = (data as any).dateOfBirth as string | undefined;

          let dobMoment: Moment | null = null;
          let age = data.age;

          if (dobStr) {
            dobMoment = moment(dobStr);
            if (dobMoment.isValid()) {
              age = moment().diff(dobMoment, 'years');
            }
          } else if (typeof data.age === 'number') {
            const approxYear = new Date().getFullYear() - data.age;
            dobMoment = moment(`${approxYear}-01-01`, 'YYYY-MM-DD');
          }

          this.profile = {
            ...(data as any),
            age
          } as UserProfile;

          this.profileFg.patchValue({
            emailCtrl: this.profile.email,
            nameCtrl: this.profile.name,
            lastNameCtrl: this.profile.lastName,
            phoneNumCtrl: this.profile.phoneNum,
            userNameCtrl: this.profile.userName,
            genderCtrl: this.profile.gender?.toLowerCase(),
            dateOfBirthCtrl: dobMoment && dobMoment.isValid() ? dobMoment : null
          });
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'خطا در بارگذاری پروفایل. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    });
  }

  /** GET /member/get-course */
  private getCourse(): void {
    this._memberService.getCourses().subscribe({
      next: data => {
        if (data !== null) {
          this.courses = data;
          this.shamsiCourses = data.map(course => ({
            ...course,
            shamsiStart: moment(course.start).format('jYYYY/jMM/jDD')
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'خطا در بارگذاری دوره ها لطفا دوباره تلاش کنید.';
        this.loading = false;
      }
    });
  }

  // ───── UI helpers

  getProfilePhoto(): string {
    if (this.profile?.photoUrl && this.profile.photoUrl.trim() !== '') {
      return this.profile.photoUrl;
    }

    if (this.profile?.gender === 'male') {
      return 'assets/images/menProfilePhoto.png';
    }

    return 'assets/images/womenProfilePhoto.png';
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 2 && !this.courseLoaded && this.loggedInUserSig?.()?.roles?.includes('student')) {
      this.getCourse();
      this.courseLoaded = true;
    }
  }

  private toGregorianDateOnly(value: Moment | Date | string | null | undefined): string | undefined {
    if (!value) return undefined;

    if (moment.isMoment(value)) {
      return value.locale('en').format('YYYY-MM-DD');
    }

    if (typeof value === 'string') {
      const m = moment(value);
      if (m.isValid()) {
        return m.locale('en').format('YYYY-MM-DD');
      }
      const d = new Date(value);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
    }

    const d = value as Date;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }

  // ───── Profile edit

  enableProfileEdit(): void {
    this.profileEditMode = true;

    this.profileFg.enable();

    this.EmailCtrl.disable();
    this.UserNameCtrl.disable();
  }

  saveProfileChanges(): void {
    if (this.profileFg.invalid || !this.profile) return;

    const dobControlValue = this.DateOfBirthCtrl.value as Moment | Date | string | null;
    const dobGregorian = this.toGregorianDateOnly(dobControlValue);

    if (!dobGregorian) {
      this._matSnackBar.open('لطفاً تاریخ تولد را به‌درستی وارد کنید', 'بستن', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 4000
      });
      return;
    }

    const updatedMember: MemberUpdate = {
      email: this.EmailCtrl.value,
      name: this.NameCtrl.value,
      lastName: this.LastNameCtrl.value,
      phoneNum: this.PhoneNumCtrl.value,
      gender: this.GenderCtrl.value,
      dateOfBirth: dobGregorian
    };

    this._memberService.updateUser(updatedMember)
      .pipe(take(1))
      .subscribe({
        next: (res: ApiResponse) => {
          const dobMoment = moment(dobGregorian);
          const newAge = dobMoment.isValid()
            ? moment().diff(dobMoment, 'years')
            : this.profile!.age;

          this.profile = {
            ...(this.profile as UserProfile),
            email: updatedMember.email,
            name: updatedMember.name,
            lastName: updatedMember.lastName,
            phoneNum: updatedMember.phoneNum,
            gender: updatedMember.gender,
            age: newAge,
            dateOfBirth: dobGregorian
          } as UserProfile;

          this.profileEditMode = false;
          this.profileFg.disable();

          this._matSnackBar.open(res.message ?? 'پروفایل با موفقیت به‌روزرسانی شد', 'بستن', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
          });
        },
        error: err => {
          const msg = err?.error ?? 'خطا در به‌روزرسانی پروفایل. لطفاً دوباره تلاش کنید.';
          this._matSnackBar.open(msg, 'بستن', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 5000
          });
        }
      });
  }

  cancelProfileEdit(): void {
    this.profileEditMode = false;
    this.profileFg.disable();

    if (this.profile) {
      const dobMoment = this.profile.dateOfBirth
        ? moment(this.profile.dateOfBirth)
        : null;

      this.profileFg.patchValue({
        emailCtrl: this.profile.email,
        nameCtrl: this.profile.name,
        lastNameCtrl: this.profile.lastName,
        phoneNumCtrl: this.profile.phoneNum,
        userNameCtrl: this.profile.userName,
        genderCtrl: this.profile.gender?.toLowerCase(),
        dateOfBirthCtrl: dobMoment?.isValid() ? dobMoment : null
      });
    }

    this.EmailCtrl.disable();
    this.UserNameCtrl.disable();
  }

  // ───── Password edit

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
        next: (response: ApiResponse) => {
          this._matSnackBar.open(response.message ?? 'رمز عبور با موفقیت به‌روزرسانی شد', 'بستن', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 5000
          });

          this.memberEditFg.reset();
        },
        error: err => {
          const msg = err?.error ?? 'خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.';
          this._matSnackBar.open(msg, 'بستن', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 6000
          });
        }
      });
  }

  cancelPasswordEdit(): void {
    this.memberEditFg.reset();
  }
}