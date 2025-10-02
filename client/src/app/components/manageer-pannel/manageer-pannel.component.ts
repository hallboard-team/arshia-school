import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import {
  FormsModule, ReactiveFormsModule, FormBuilder, Validators,
  FormControl, FormGroup, FormGroupDirective
} from '@angular/forms';
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
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { DatepickerComponent } from '../../datepicker/datepicker.component';
import moment from 'moment-jalaali';

@Component({
  selector: 'app-manageer-pannel',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatRadioModule,
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule, NavbarComponent, DatepickerComponent
  ],
  templateUrl: './manageer-pannel.component.html',
  styleUrl: './manageer-pannel.component.scss',
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }]
})
export class ManageerPannelComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private deleteSubscription: Subscription | undefined;
  fb = inject(FormBuilder);

  accountService = inject(AccountService);
  managerService = inject(ManagerService);

  private readonly NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s\u200c-]+$/;

  minDob!: moment.Moment;
  maxDob!: moment.Moment;

  passowrdsNotMatch: boolean | undefined;
  loggedInUser: LoggedInUser | null | undefined;

  uiYearView = true;
  uiMonthView = true;
  uiHideAfterSelectDate = false;
  uiHideOnOutsideClick = false;
  uiTodayBtnEnable = true;

  shamsiDisplayDateStu = '';
  shamsiDisplayDateTea = '';
  shamsiDisplayDateSec = '';

  uiIsVisibleStu = false;
  uiIsVisibleTea = false;
  uiIsVisibleSec = false;

  hideSecretaryPassword = true;
  hideSecretaryConfirmPassword = true;
  hideStudentPassword = true;
  hideStudentConfirmPassword = true;
  hideTeacherPassword = true;
  hideTeacherConfirmPassword = true;

  @ViewChild('secForm', { read: FormGroupDirective }) secFormDir!: FormGroupDirective;
  @ViewChild('stuForm', { read: FormGroupDirective }) stuFormDir!: FormGroupDirective;
  @ViewChild('teachForm', { read: FormGroupDirective }) teachFormDir!: FormGroupDirective;

  constructor() {
    this.loggedInUser = this.accountService.loggedInUserSig();
  }

  ngOnInit(): void {
    const today = new Date();
    const maxDob = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());
    const minDob = new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());

    this.maxDob = moment().subtract(11, 'jYear').endOf('jYear');
    this.minDob = moment().subtract(99, 'jYear').startOf('jYear');
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }

  addSecretaryFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  addTeacherFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: [null, [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  addStudentFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  get SecretaryGenderCtrl(): FormControl { return this.addSecretaryFg.get('genderCtrl') as FormControl; }
  get SecretaryEmailCtrl(): FormControl { return this.addSecretaryFg.get('emailCtrl') as FormControl; }
  get SecretaryPasswordCtrl(): FormControl { return this.addSecretaryFg.get('passwordCtrl') as FormControl; }
  get SecretaryConfirmPasswordCtrl(): FormControl { return this.addSecretaryFg.get('confirmPasswordCtrl') as FormControl; }
  get SecretaryNameCtrl(): FormControl { return this.addSecretaryFg.get('nameCtrl') as FormControl; }
  get SecretaryLastNameCtrl(): FormControl { return this.addSecretaryFg.get('lastNameCtrl') as FormControl; }
  get SecretaryPhoneNumCtrl(): FormControl { return this.addSecretaryFg.get('phoneNumCtrl') as FormControl; }
  get SecretaryDateOfBirthCtrl(): FormControl { return this.addSecretaryFg.get('dateOfBirthCtrl') as FormControl; }

  get TeacherGenderCtrl(): FormControl { return this.addTeacherFg.get('genderCtrl') as FormControl; }
  get TeacherEmailCtrl(): FormControl { return this.addTeacherFg.get('emailCtrl') as FormControl; }
  get TeacherPasswordCtrl(): FormControl { return this.addTeacherFg.get('passwordCtrl') as FormControl; }
  get TeacherConfirmPasswordCtrl(): FormControl { return this.addTeacherFg.get('confirmPasswordCtrl') as FormControl; }
  get TeacherNameCtrl(): FormControl { return this.addTeacherFg.get('nameCtrl') as FormControl; }
  get TeacherLastNameCtrl(): FormControl { return this.addTeacherFg.get('lastNameCtrl') as FormControl; }
  get TeacherPhoneNumCtrl(): FormControl { return this.addTeacherFg.get('phoneNumCtrl') as FormControl; }
  get TeacherDateOfBirthCtrl(): FormControl { return this.addTeacherFg.get('dateOfBirthCtrl') as FormControl; }

  get StudentGenderCtrl(): FormControl { return this.addStudentFg.get('genderCtrl') as FormControl; }
  get StudentEmailCtrl(): FormControl { return this.addStudentFg.get('emailCtrl') as FormControl; }
  get StudentPasswordCtrl(): FormControl { return this.addStudentFg.get('passwordCtrl') as FormControl; }
  get StudentConfirmPasswordCtrl(): FormControl { return this.addStudentFg.get('confirmPasswordCtrl') as FormControl; }
  get StudentNameCtrl(): FormControl { return this.addStudentFg.get('nameCtrl') as FormControl; }
  get StudentLastNameCtrl(): FormControl { return this.addStudentFg.get('lastNameCtrl') as FormControl; }
  get StudentPhoneNumCtrl(): FormControl { return this.addStudentFg.get('phoneNumCtrl') as FormControl; }
  get StudentDateOfBirthCtrl(): FormControl { return this.addStudentFg.get('dateOfBirthCtrl') as FormControl; }

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

  private extractServerMessages(err: any): string[] {
    if (Array.isArray(err?.error)) return err.error.map((x: any) => x?.toString?.() ?? String(x));
    if (Array.isArray(err?.error?.errors)) return err.error.errors.map((x: any) => x?.toString?.() ?? String(x));

    const modelErrors = err?.error?.errors;
    if (modelErrors && typeof modelErrors === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(modelErrors)) {
        const arr = modelErrors[k];
        if (Array.isArray(arr)) msgs.push(...arr.map((x: any) => x?.toString?.() ?? String(x)));
      }
      if (msgs.length) return msgs;
    }

    const raw = (err?.error?.message ?? err?.error ?? err?.Message ?? err?.title)?.toString();
    return raw ? [raw] : [];
  }

  private faMessage(s: string): string {
    const m = s.toLowerCase();
    if (m.includes('at least 8')) return 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
    if (m.includes('non alphanumeric')) return 'رمز عبور باید حداقل یک کاراکتر خاص مثل !@# داشته باشد.';
    if (m.includes('uppercase')) return 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی (A-Z) داشته باشد.';
    if (m.includes('lowercase')) return 'رمز عبور باید حداقل یک حرف کوچک انگلیسی (a-z) داشته باشد.';
    if (m.includes('digit') || m.includes('number')) return 'رمز عبور باید حداقل یک رقم داشته باشد.';
    if (m.includes('passwords must match') || (m.includes('confirm') && m.includes('password')))
      return 'رمز عبور و تکرار آن یکسان نیستند.';
    if (m.includes('email')) return 'ایمیل معتبر نیست.';
    return s;
  }

  private applyServerErrorsToForm(group: FormGroup, messages: string[]): void {
    const markKeys = ['emailCtrl', 'passwordCtrl', 'confirmPasswordCtrl'];
    markKeys.forEach(k => group.get(k)?.markAsTouched());

    markKeys.forEach(k => {
      const c = group.get(k);
      if (!c) return;
      const errs = { ...(c.errors || {}) };
      delete (errs as any)['server'];
      if (Object.keys(errs).length) c.setErrors(errs);
      else c.setErrors(null);
    });

    const passMsgs = messages.filter(m => /password/i.test(m));
    if (passMsgs.length) {
      const msg = '• ' + passMsgs.map(m => this.faMessage(m)).join('\n• ');
      const p = group.get('passwordCtrl'); const cp = group.get('confirmPasswordCtrl');
      p?.setErrors({ ...(p?.errors || {}), server: msg });
      cp?.setErrors({ ...(cp?.errors || {}), server: msg });
    }

    const emailMsgs = messages.filter(m => /email/i.test(m));
    if (emailMsgs.length) {
      const msg = '• ' + emailMsgs.map(m => this.faMessage(m)).join('\n• ');
      const e = group.get('emailCtrl');
      e?.setErrors({ ...(e?.errors || {}), server: msg });
    }

  }

  private translateServerError(err: any): string {
    const modelErrors = err?.error?.errors;
    if (modelErrors && typeof modelErrors === 'object') {
      const msgs: string[] = [];
      for (const k of Object.keys(modelErrors)) {
        const arr = modelErrors[k];
        if (Array.isArray(arr)) msgs.push(...arr);
      }
      if (msgs.length) return msgs.join(' | ');
    }
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

  private resetForm(fg: FormGroup, kind: 'student' | 'teacher' | 'secretary'): void {
    fg.reset();
    fg.markAsPristine();
    fg.markAsUntouched();
    fg.updateValueAndValidity();

    if (kind === 'student' && this.stuFormDir) this.stuFormDir.resetForm();
    if (kind === 'teacher' && this.teachFormDir) this.teachFormDir.resetForm();
    if (kind === 'secretary' && this.secFormDir) this.secFormDir.resetForm();

    if (kind === 'student') {
      this.shamsiDisplayDateStu = '';
      this.uiIsVisibleStu = false;
      this.hideStudentPassword = true;
      this.hideStudentConfirmPassword = true;
    } else if (kind === 'teacher') {
      this.shamsiDisplayDateTea = '';
      this.uiIsVisibleTea = false;
      this.hideTeacherPassword = true;
      this.hideTeacherConfirmPassword = true;
    } else {
      this.shamsiDisplayDateSec = '';
      this.uiIsVisibleSec = false;
      this.hideSecretaryPassword = true;
      this.hideSecretaryConfirmPassword = true;
    }
  }

  private toGregorianDateOnly(v: any): string | undefined {
    if (!v) return undefined;
    if (typeof v?.format === 'function') return v.format('YYYY-MM-DD');
    const d = new Date(v);
    return new Date(d.setMinutes(d.getMinutes() - d.getTimezoneOffset()))
      .toISOString().slice(0, 10);
  }

  // ---------- submits ----------
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
      next: _ => { this.openSnack('دانشجو با موفقیت ثبت شد.', 'success'); this.resetForm(this.addStudentFg, 'student'); },
      error: err => {
        const msgs = this.extractServerMessages(err);
        if (msgs.length) {
          this.applyServerErrorsToForm(this.addStudentFg, msgs);
          this.openSnack('خطای اعتبارسنجی:\n• ' + msgs.map(m => this.faMessage(m)).join('\n• '), 'error');
        } else {
          this.openSnack(this.translateServerError(err), 'error');
        }
      }
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
      next: _ => { this.openSnack('منشی با موفقیت ثبت شد.', 'success'); this.resetForm(this.addSecretaryFg, 'secretary'); },
      error: err => {
        const msgs = this.extractServerMessages(err);
        if (msgs.length) {
          this.applyServerErrorsToForm(this.addSecretaryFg, msgs);
          this.openSnack('خطای اعتبارسنجی:\n• ' + msgs.map(m => this.faMessage(m)).join('\n• '), 'error');
        } else {
          this.openSnack(this.translateServerError(err), 'error');
        }
      }
    });
  }

  addTeacher(): void {
    if (this.TeacherPasswordCtrl.value !== this.TeacherConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = true;
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }
    this.passowrdsNotMatch = false;

    const dob = this.toGregorianDateOnly(this.TeacherDateOfBirthCtrl.value);

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
      next: _ => { this.openSnack('مدرس با موفقیت ثبت شد.', 'success'); this.resetForm(this.addTeacherFg, 'teacher'); },
      error: err => {
        const msgs = this.extractServerMessages(err);
        if (msgs.length) {
          this.applyServerErrorsToForm(this.addTeacherFg, msgs);
          this.openSnack('خطای اعتبارسنجی:\n• ' + msgs.map(m => this.faMessage(m)).join('\n• '), 'error');
        } else {
          this.openSnack(this.translateServerError(err), 'error');
        }
      }
    });
  }

  onStudentDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDateStu = event.shamsi;
    this.StudentDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisibleStu = false;
  }

  onTeacherDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDateTea = event.shamsi;
    this.TeacherDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisibleTea = false;
  }

  onSecretaryDateSelect(event: { shamsi: string; gregorian: string; timestamp: number; }): void {
    this.shamsiDisplayDateSec = event.shamsi;
    this.SecretaryDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.uiIsVisibleSec = false;
  }

  showErr(ctrl: FormControl | null | undefined): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}