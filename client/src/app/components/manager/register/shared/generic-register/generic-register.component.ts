import { Component, EventEmitter, Input, Output, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { DatepickerComponent } from '../../../../../datepicker/datepicker.component';
import moment, { Moment } from 'moment-jalaali';
import { RegisterUser } from '../../../../../models/register-user.model'; 

@Component({
  selector: 'app-generic-register-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatRadioModule, MatIconModule, DatepickerComponent
  ],
  templateUrl: './generic-register.component.html',
  styleUrls: ['./generic-register.component.scss']
})
export class GenericRegisterFormComponent {
  private fb = inject(FormBuilder);

  @Input({ required: true }) formTitle: string = ''; // عنوان فرم (ثبت منشی، دانشجو و...)
  @Input() isLoading: boolean = false; // برای غیرفعال کردن دکمه هنگام ارسال

  // خروجی (دیتای نهایی فرم)
  @Output() formSubmit = new EventEmitter<RegisterUser>();

  @ViewChild(FormGroupDirective) formDir!: FormGroupDirective;

  hidePassword = true;
  hideConfirmPassword = true;

  // تنظیمات تاریخ و Regex
  readonly minAge = 11;
  readonly maxAge = 90;
  min = moment().subtract(this.maxAge, 'jYear').startOf('day');
  max = moment().subtract(this.minAge, 'jYear').endOf('day');
  private readonly NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s\u200c-]+$/;

  // ساخت فرم با نام‌های عمومی (Generic)
  form = this.fb.group({
    email: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    password: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30), Validators.pattern(this.NAME_REGEX)]],
    phoneNum: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    dateOfBirth: ['', [Validators.required]],
    gender: ['', [Validators.required]]
  });

  // Getters برای دسترسی آسان در HTML
  get f() { return this.form.controls; }

  // متد Submit
  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.f.password.value !== this.f.confirmPassword.value) {
      // اینجا می‌توانیم ارور ست کنیم یا فقط ریترن کنیم (هندل کردن ارور در کامپوننت والد یا اسنک‌بار مشترک)
      this.f.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    const dob = this.f.dateOfBirth.value as any;
    // چک کردن اعتبار تاریخ (اختیاری، چون دیت‌پیکر معمولا هندل میکند)
    
    // آماده‌سازی Payload
    const payload: RegisterUser = {
      email: this.f.email.value!,
      password: this.f.password.value!,
      confirmPassword: this.f.confirmPassword.value!,
      gender: this.f.gender.value!,
      dateOfBirth: this.toGregorianDateOnly(dob)!,
      name: this.f.name.value!,
      lastName: this.f.lastName.value!,
      phoneNum: '98' + this.f.phoneNum.value!
    };

    this.formSubmit.emit(payload);
  }

  // متد کمکی برای ریست کردن فرم بعد از موفقیت (توسط والد صدا زده می‌شود)
  resetForm(): void {
    this.formDir?.resetForm();
    this.form.reset();
  }

  // متد کمکی برای نمایش ارورهای سرور روی فیلدها (توسط والد صدا زده می‌شود)
  setServerErrors(messages: string[]): void {
    const markKeys = ['email', 'password', 'confirmPassword'];
    // @ts-ignore
    markKeys.forEach(k => this.form.get(k)?.markAsTouched());

    const passMsgs = messages.filter(m => /password/i.test(m));
    if (passMsgs.length) {
      const msg = passMsgs.join(' - ');
      this.f.password.setErrors({ server: msg });
      this.f.confirmPassword.setErrors({ server: msg });
    }

    const emailMsgs = messages.filter(m => /email/i.test(m));
    if (emailMsgs.length) {
       this.f.email.setErrors({ server: emailMsgs.join(' - ') });
    }
  }

  private toGregorianDateOnly(value: Moment | Date | string | null | undefined): string | undefined {
     // همان لاجیک خودت کپی شد
     if (!value) return undefined;
     if (moment.isMoment(value)) return value.locale('en').format('YYYY-MM-DD');
     if (typeof value === 'string') {
       const m = moment(value);
       return m.isValid() ? m.locale('en').format('YYYY-MM-DD') : new Date(value).toISOString().slice(0, 10);
     }
     const d = value as Date;
     return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }
}