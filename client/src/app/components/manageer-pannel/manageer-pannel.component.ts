import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { RegisterUser } from '../../models/register-user.model';
import { ManagerService } from '../../services/manager.service';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import moment from 'moment-jalaali';
import { defaultTheme, IDatepickerTheme, NgPersianDatepickerModule } from '../../../../projects/ng-persian-datepicker/src/public-api';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
  selector: 'app-manageer-pannel',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatRadioModule,
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule, NavbarComponent,
    NgPersianDatepickerModule
  ],
  templateUrl: './manageer-pannel.component.html',
  styleUrl: './manageer-pannel.component.scss'
})
export class ManageerPannelComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private deleteSubscription: Subscription | undefined;
  fb = inject(FormBuilder);

  accountService = inject(AccountService);
  managerService = inject(ManagerService);

  minDate = new Date();
  maxDate = new Date();

  passowrdsNotMatch: boolean | undefined;
  loggedInUser: LoggedInUser | null | undefined;

  uiIsVisible = true;
  uiTheme: IDatepickerTheme = defaultTheme;
  uiYearView = true;
  uiMonthView = true;
  uiHideAfterSelectDate = false;
  uiHideOnOutsideClick = false;
  uiTodayBtnEnable = true;

  shamsiDisplayDate = '';
  hideSecretaryPassword = true;
  hideSecretaryConfirmPassword = true;

  hideStudentPassword = true;
  hideStudentConfirmPassword = true;

  hideTeacherPassword = true;
  hideTeacherConfirmPassword = true;

  constructor() {
    this.loggedInUser = this.accountService.loggedInUserSig();
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 99, 0, 1);
    this.maxDate = new Date(currentYear - 15, 0, 1);
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }

  // ------------------ Forms ------------------
  addSecretaryFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  addTeacherFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  addStudentFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  // ------------------ Getters ------------------
  // Secretary
  get SecretaryGenderCtrl(): FormControl { return this.addSecretaryFg.get('genderCtrl') as FormControl; }
  get SecretaryEmailCtrl(): FormControl { return this.addSecretaryFg.get('emailCtrl') as FormControl; }
  get SecretaryPasswordCtrl(): FormControl { return this.addSecretaryFg.get('passwordCtrl') as FormControl; }
  get SecretaryConfirmPasswordCtrl(): FormControl { return this.addSecretaryFg.get('confirmPasswordCtrl') as FormControl; }
  get SecretaryNameCtrl(): FormControl { return this.addSecretaryFg.get('nameCtrl') as FormControl; }
  get SecretaryLastNameCtrl(): FormControl { return this.addSecretaryFg.get('lastNameCtrl') as FormControl; }
  get SecretaryPhoneNumCtrl(): FormControl { return this.addSecretaryFg.get('phoneNumCtrl') as FormControl; }
  get SecretaryDateOfBirthCtrl(): FormControl { return this.addSecretaryFg.get('dateOfBirthCtrl') as FormControl; }

  // Teacher
  get TeacherGenderCtrl(): FormControl { return this.addTeacherFg.get('genderCtrl') as FormControl; }
  get TeacherEmailCtrl(): FormControl { return this.addTeacherFg.get('emailCtrl') as FormControl; }
  get TeacherPasswordCtrl(): FormControl { return this.addTeacherFg.get('passwordCtrl') as FormControl; }
  get TeacherConfirmPasswordCtrl(): FormControl { return this.addTeacherFg.get('confirmPasswordCtrl') as FormControl; }
  get TeacherNameCtrl(): FormControl { return this.addTeacherFg.get('nameCtrl') as FormControl; }
  get TeacherLastNameCtrl(): FormControl { return this.addTeacherFg.get('lastNameCtrl') as FormControl; }
  get TeacherPhoneNumCtrl(): FormControl { return this.addTeacherFg.get('phoneNumCtrl') as FormControl; }
  get TeacherDateOfBirthCtrl(): FormControl { return this.addTeacherFg.get('dateOfBirthCtrl') as FormControl; }

  // Student
  get StudentGenderCtrl(): FormControl { return this.addStudentFg.get('genderCtrl') as FormControl; }
  get StudentEmailCtrl(): FormControl { return this.addStudentFg.get('emailCtrl') as FormControl; }
  get StudentPasswordCtrl(): FormControl { return this.addStudentFg.get('passwordCtrl') as FormControl; }
  get StudentConfirmPasswordCtrl(): FormControl { return this.addStudentFg.get('confirmPasswordCtrl') as FormControl; }
  get StudentNameCtrl(): FormControl { return this.addStudentFg.get('nameCtrl') as FormControl; }
  get StudentLastNameCtrl(): FormControl { return this.addStudentFg.get('lastNameCtrl') as FormControl; }
  get StudentPhoneNumCtrl(): FormControl { return this.addStudentFg.get('phoneNumCtrl') as FormControl; }
  get StudentDateOfBirthCtrl(): FormControl { return this.addStudentFg.get('dateOfBirthCtrl') as FormControl; }

  // ------------------ Helpers ------------------
  private openSnack(message: string, panel: 'success' | 'error' | 'info' = 'error'): void {
    const mapClass: Record<'success' | 'error' | 'info', string> = {
      success: 'snack-success',
      error: 'snack-error',
      info: 'snack-info'
    };

    this.snackBar.open(message, 'باشه', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [mapClass[panel]],
      direction: 'rtl'
    });
  }

  private translateServerError(err: any): string {
    const status = err?.status;
    const rawStr = (err?.error?.message ?? err?.error ?? err?.Message ?? err?.title ?? '').toString();
    const raw = rawStr.toLowerCase();

    if (status === 409) return 'این ایمیل قبلاً ثبت شده است.';
    if (status === 0) return 'عدم دسترسی به سرور. اینترنت خود را بررسی کنید.';
    if (status === 400) {
      if (raw.includes('email')) return 'ایمیل معتبر نیست.';
      return 'اطلاعات واردشده معتبر نیست.';
    }
    if (status === 401) return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
    if (status === 403) return 'اجازه دسترسی ندارید.';
    if (status === 404) return 'موردی یافت نشد.';
    if (status === 422) return 'اطلاعات واردشده معتبر نیست.';

    if (raw.includes('e11000') || raw.includes('duplicate') || raw.includes('unique') || (raw.includes('email') && raw.includes('exist')))
      return 'این ایمیل قبلاً ثبت شده است.';
    if (raw.includes('invalid') && raw.includes('email')) return 'ایمیل معتبر نیست.';
    if (raw.includes('password') && (raw.includes('short') || raw.includes('length'))) return 'رمز عبور خیلی کوتاه است.';
    if (raw.includes('confirm') && raw.includes('password')) return 'رمز عبور و تکرار آن یکسان نیستند.';
    if (raw.includes('required') || raw.includes('must not be empty')) return 'برخی فیلدهای الزامی خالی است.';

    return 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.';
  }

  private getDateOnly(dob: string | null): string | undefined {
    if (!dob) return undefined;
    const theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset()))
      .toISOString()
      .slice(0, 10);
  }

  // ------------------ Submit handlers ------------------
  addStudent(): void {
    if (this.StudentPasswordCtrl.value !== this.StudentConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = true;
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }
    this.passowrdsNotMatch = false;

    const dob = this.getDateOnly(this.StudentDateOfBirthCtrl.value);

    const registerUser: RegisterUser = {
      email: this.StudentEmailCtrl.value,
      password: this.StudentPasswordCtrl.value,
      confirmPassword: this.StudentConfirmPasswordCtrl.value,
      gender: this.StudentGenderCtrl.value,
      dateOfBirth: dob,
      name: this.StudentNameCtrl.value,
      lastName: this.StudentLastNameCtrl.value,
      phoneNum: '98' + this.StudentPhoneNumCtrl.value
    };

    this.managerService.createStudent(registerUser).subscribe({
      next: _ => this.openSnack('دانشجو با موفقیت ثبت شد.', 'success'),
      error: err => this.openSnack(this.translateServerError(err), 'error')
    });
  }

  addSecretary(): void {
    if (this.SecretaryPasswordCtrl.value !== this.SecretaryConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = true;
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }
    this.passowrdsNotMatch = false;

    const dob = this.getDateOnly(this.SecretaryDateOfBirthCtrl.value);

    const registerUser: RegisterUser = {
      email: this.SecretaryEmailCtrl.value,
      password: this.SecretaryPasswordCtrl.value,
      confirmPassword: this.SecretaryConfirmPasswordCtrl.value,
      gender: this.SecretaryGenderCtrl.value,
      dateOfBirth: dob,
      name: this.SecretaryNameCtrl.value,
      lastName: this.SecretaryLastNameCtrl.value,
      phoneNum: '98' + this.SecretaryPhoneNumCtrl.value
    };

    this.managerService.createSecretary(registerUser).subscribe({
      next: _ => this.openSnack('منشی با موفقیت ثبت شد.', 'success'),
      error: err => this.openSnack(this.translateServerError(err), 'error')
    });
  }

  addTeacher(): void {
    if (this.TeacherPasswordCtrl.value !== this.TeacherConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = true;
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }
    this.passowrdsNotMatch = false;

    const dob = this.getDateOnly(this.TeacherDateOfBirthCtrl.value);

    const registerUser: RegisterUser = {
      email: this.TeacherEmailCtrl.value,
      password: this.TeacherPasswordCtrl.value,
      confirmPassword: this.TeacherConfirmPasswordCtrl.value,
      gender: this.TeacherGenderCtrl.value,
      dateOfBirth: dob,
      name: this.TeacherNameCtrl.value,
      lastName: this.TeacherLastNameCtrl.value,
      phoneNum: '98' + this.TeacherPhoneNumCtrl.value
    };

    this.managerService.createTeacher(registerUser).subscribe({
      next: _ => this.openSnack('مدرس با موفقیت ثبت شد.', 'success'),
      error: err => this.openSnack(this.translateServerError(err), 'error')
    });
  }

  // ------------------ Date pickers ------------------
  onStudentDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDate = event.shamsi;
    this.StudentDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisible = false;
  }

  onTeacherDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDate = event.shamsi;
    this.TeacherDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisible = false;
  }

  onSecretaryDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDate = event.shamsi;
    this.SecretaryDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisible = false;
  }
}