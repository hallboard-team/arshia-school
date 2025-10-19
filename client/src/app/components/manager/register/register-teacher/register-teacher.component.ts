import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ManagerService } from '../../../../services/manager.service';
import { RegisterUser } from '../../../../models/register-user.model';
import { MatIconModule } from "@angular/material/icon";
import moment, { Moment } from 'moment-jalaali';
import { DatepickerComponent } from '../../../../datepicker/datepicker.component';

@Component({
  selector: 'app-register-teacher',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatRadioModule, MatIconModule,
    DatepickerComponent
  ],
  templateUrl: './register-teacher.component.html',
  styleUrl: './register-teacher.component.scss'
})
export class RegisterTeacherComponent {
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private managerService = inject(ManagerService);

  hideTeacherPassword = true;
  hideTeacherConfirmPassword = true;

  private readonly NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s\u200c-]+$/;

  @ViewChild('teachForm', { read: FormGroupDirective }) teachFormDir!: FormGroupDirective;

  readonly minAge = 11;
  readonly maxAge = 90;

  min = moment().subtract(this.maxAge, 'jYear').startOf('day'); // 1358
  max = moment().subtract(this.minAge, 'jYear').endOf('day'); // 1403

  teacherFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNumCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirthCtrl: [null, [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  });

  get TeacherGenderCtrl(): FormControl { return this.teacherFg.get('genderCtrl') as FormControl; }
  get TeacherEmailCtrl(): FormControl { return this.teacherFg.get('emailCtrl') as FormControl; }
  get TeacherPasswordCtrl(): FormControl { return this.teacherFg.get('passwordCtrl') as FormControl; }
  get TeacherConfirmPasswordCtrl(): FormControl { return this.teacherFg.get('confirmPasswordCtrl') as FormControl; }
  get TeacherNameCtrl(): FormControl { return this.teacherFg.get('nameCtrl') as FormControl; }
  get TeacherLastNameCtrl(): FormControl { return this.teacherFg.get('lastNameCtrl') as FormControl; }
  get TeacherPhoneNumCtrl(): FormControl { return this.teacherFg.get('phoneNumCtrl') as FormControl; }
  get TeacherDateOfBirthCtrl(): FormControl { return this.teacherFg.get('dateOfBirthCtrl') as FormControl; }

  showErr(c: FormControl | null | undefined): boolean {
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this.snackBar.open(message, 'باشه', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'], direction: 'rtl' });
  }

  private applyServerErrorsToForm(messages: string[]): void {
    const markKeys = ['emailCtrl', 'passwordCtrl', 'confirmPasswordCtrl'];
    markKeys.forEach(k => this.teacherFg.get(k)?.markAsTouched());

    const passMsgs = messages.filter(m => /password/i.test(m));
    if (passMsgs.length) {
      const msg = '• ' + passMsgs.join('\n• ');
      const p = this.teacherFg.get('passwordCtrl'); const cp = this.teacherFg.get('confirmPasswordCtrl');
      p?.setErrors({ ...(p?.errors || {}), server: msg });
      cp?.setErrors({ ...(cp?.errors || {}), server: msg });
    }

    const emailMsgs = messages.filter(m => /email/i.test(m));
    if (emailMsgs.length) {
      const msg = '• ' + emailMsgs.join('\n• ');
      const e = this.teacherFg.get('emailCtrl');
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

  addTeacher(): void {
    if (this.TeacherPasswordCtrl.value !== this.TeacherConfirmPasswordCtrl.value) {
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }

    const dob = this.TeacherDateOfBirthCtrl.value as any;
    if (!dob || !dob.isBetween(this.min, this.max, undefined, '[]')) {
      this.openSnack(`تاریخ تولد باید بین ${this.min.format('jYYYY/jMM/jDD')} و ${this.max.format('jYYYY/jMM/jDD')} باشد.`, 'error');
      this.TeacherDateOfBirthCtrl.markAsTouched();
      return;
    }

    const payload: RegisterUser = {
      email: this.TeacherEmailCtrl.value,
      password: this.TeacherPasswordCtrl.value,
      confirmPassword: this.TeacherConfirmPasswordCtrl.value,
      gender: this.TeacherGenderCtrl.value,
      dateOfBirth: this.toGregorianDateOnly(dob),
      name: this.TeacherNameCtrl.value,
      lastName: this.TeacherLastNameCtrl.value,
      phoneNum: '98' + this.TeacherPhoneNumCtrl.value
    };

    this.managerService.createTeacher(payload).subscribe({
      next: _ => {
        this.openSnack('مدرس با موفقیت ثبت شد.', 'success');
        this.teachFormDir?.resetForm();
        this.teacherFg.reset();
      },
      error: err => {
        const msgs: string[] = Array.isArray(err?.error) ? err.error : (Array.isArray(err?.error?.errors) ? err.error.errors : []);
        if (msgs.length) this.applyServerErrorsToForm(msgs);
        this.openSnack('خطا در ثبت نام.', 'error');
      }
    });
  }
}