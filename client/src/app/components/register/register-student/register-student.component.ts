import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { ManagerService } from '../../../services/manager.service';
import { RegisterUser } from '../../../models/register-user.model';
import { MatIconModule } from "@angular/material/icon";
import moment, { Moment } from 'moment-jalaali';
import { DatepickerComponent } from '../../../datepicker/datepicker.component';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatRadioModule, AutoFocusDirective,
    MatIconModule, DatepickerComponent
  ],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.scss'
})
export class RegisterStudentComponent {
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private managerService = inject(ManagerService);

  readonly minAge = 11;
  readonly maxAge = 90;

  min = moment().subtract(this.maxAge, 'jYear').startOf('day');
  max = moment().subtract(this.minAge, 'jYear').endOf('day');

  hideStudentPassword = true;
  hideStudentConfirmPassword = true;

  private readonly NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s\u200c-]+$/;

  @ViewChild('stuForm', { read: FormGroupDirective }) stuFormDir!: FormGroupDirective;

  studentFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: [null, [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  get StudentGenderCtrl(): FormControl { return this.studentFg.get('genderCtrl') as FormControl; }
  get StudentEmailCtrl(): FormControl { return this.studentFg.get('emailCtrl') as FormControl; }
  get StudentPasswordCtrl(): FormControl { return this.studentFg.get('passwordCtrl') as FormControl; }
  get StudentConfirmPasswordCtrl(): FormControl { return this.studentFg.get('confirmPasswordCtrl') as FormControl; }
  get StudentNameCtrl(): FormControl { return this.studentFg.get('nameCtrl') as FormControl; }
  get StudentLastNameCtrl(): FormControl { return this.studentFg.get('lastNameCtrl') as FormControl; }
  get StudentPhoneNumCtrl(): FormControl { return this.studentFg.get('phoneNumCtrl') as FormControl; }
  get StudentDateOfBirthCtrl(): FormControl { return this.studentFg.get('dateOfBirthCtrl') as FormControl; }

  showErr(c: FormControl | null | undefined): boolean {
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this.snackBar.open(message, 'باشه', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'], direction: 'rtl' });
  }

  private applyServerErrorsToForm(messages: string[]): void {
    const markKeys = ['emailCtrl', 'passwordCtrl', 'confirmPasswordCtrl'];
    markKeys.forEach(k => this.studentFg.get(k)?.markAsTouched());

    const passMsgs = messages.filter(m => /password/i.test(m));
    if (passMsgs.length) {
      const msg = '• ' + passMsgs.join('\n• ');
      const p = this.studentFg.get('passwordCtrl'); const cp = this.studentFg.get('confirmPasswordCtrl');
      p?.setErrors({ ...(p?.errors || {}), server: msg });
      cp?.setErrors({ ...(cp?.errors || {}), server: msg });
    }

    const emailMsgs = messages.filter(m => /email/i.test(m));
    if (emailMsgs.length) {
      const msg = '• ' + emailMsgs.join('\n• ');
      const e = this.studentFg.get('emailCtrl');
      e?.setErrors({ ...(e?.errors || {}), server: msg });
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

  addStudent(): void {
    if (this.StudentPasswordCtrl.value !== this.StudentConfirmPasswordCtrl.value) {
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }

    const dob = this.StudentDateOfBirthCtrl.value as any;
    if (!dob || !dob.isBetween(this.min, this.max, undefined, '[]')) {
      this.openSnack(`تاریخ تولد باید بین ${this.min.format('jYYYY/jMM/jDD')} و ${this.max.format('jYYYY/jMM/jDD')} باشد.`, 'error');
      this.StudentDateOfBirthCtrl.markAsTouched();
      return;
    }

    const payload: RegisterUser = {
      email: this.StudentEmailCtrl.value,
      password: this.StudentPasswordCtrl.value,
      confirmPassword: this.StudentConfirmPasswordCtrl.value,
      gender: this.StudentGenderCtrl.value,
      dateOfBirth: this.toGregorianDateOnly(dob),
      name: this.StudentNameCtrl.value,
      lastName: this.StudentLastNameCtrl.value,
      phoneNum: '98' + this.StudentPhoneNumCtrl.value
    };

    this.managerService.createStudent(payload).subscribe({
      next: _ => {
        this.openSnack('دانشجو با موفقیت ثبت شد.', 'success');
        this.stuFormDir?.resetForm();
        this.studentFg.reset();
      },
      error: err => {
        const msgs: string[] = Array.isArray(err?.error) ? err.error : (Array.isArray(err?.error?.errors) ? err.error.errors : []);
        if (msgs.length) this.applyServerErrorsToForm(msgs);
        this.openSnack('خطا در ثبت نام.', 'error');
      }
    });
  }
}