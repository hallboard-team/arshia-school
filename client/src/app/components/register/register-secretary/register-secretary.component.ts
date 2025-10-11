import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { ManagerService } from '../../../services/manager.service';
import { RegisterUser } from '../../../models/register-user.model';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-register-secretary',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatRadioModule, AutoFocusDirective,
    MatIconModule
  ],
  templateUrl: './register-secretary.component.html',
  styleUrl: './register-secretary.component.scss'
})
export class RegisterSecretaryComponent {
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private managerService = inject(ManagerService);

  hideSecretaryPassword = true;
  hideSecretaryConfirmPassword = true;

  private readonly NAME_REGEX = /^[\u0600-\u06FFa-zA-Z\s\u200c-]+$/;

  @ViewChild('secForm', { read: FormGroupDirective }) secFormDir!: FormGroupDirective;

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

  get SecretaryGenderCtrl(): FormControl { return this.addSecretaryFg.get('genderCtrl') as FormControl; }
  get SecretaryEmailCtrl(): FormControl { return this.addSecretaryFg.get('emailCtrl') as FormControl; }
  get SecretaryPasswordCtrl(): FormControl { return this.addSecretaryFg.get('passwordCtrl') as FormControl; }
  get SecretaryConfirmPasswordCtrl(): FormControl { return this.addSecretaryFg.get('confirmPasswordCtrl') as FormControl; }
  get SecretaryNameCtrl(): FormControl { return this.addSecretaryFg.get('nameCtrl') as FormControl; }
  get SecretaryLastNameCtrl(): FormControl { return this.addSecretaryFg.get('lastNameCtrl') as FormControl; }
  get SecretaryPhoneNumCtrl(): FormControl { return this.addSecretaryFg.get('phoneNumCtrl') as FormControl; }
  get SecretaryDateOfBirthCtrl(): FormControl { return this.addSecretaryFg.get('dateOfBirthCtrl') as FormControl; }

  showErr(ctrl: FormControl | null | undefined): boolean {
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this.snackBar.open(message, 'باشه', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'], direction: 'rtl' });
  }

  private getDateOnly(dob: string | null): string | undefined {
    if (!dob) return undefined;
    const theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }

  private applyServerErrorsToForm(messages: string[]): void {
    const markKeys = ['emailCtrl', 'passwordCtrl', 'confirmPasswordCtrl'];
    markKeys.forEach(k => this.addSecretaryFg.get(k)?.markAsTouched());

    const passMsgs = messages.filter(m => /password/i.test(m));
    if (passMsgs.length) {
      const msg = '• ' + passMsgs.join('\n• ');
      const p = this.addSecretaryFg.get('passwordCtrl'); const cp = this.addSecretaryFg.get('confirmPasswordCtrl');
      p?.setErrors({ ...(p?.errors || {}), server: msg });
      cp?.setErrors({ ...(cp?.errors || {}), server: msg });
    }

    const emailMsgs = messages.filter(m => /email/i.test(m));
    if (emailMsgs.length) {
      const msg = '• ' + emailMsgs.join('\n• ');
      const e = this.addSecretaryFg.get('emailCtrl');
      e?.setErrors({ ...(e?.errors || {}), server: msg });
    }
  }

  addSecretary(): void {
    if (this.SecretaryPasswordCtrl.value !== this.SecretaryConfirmPasswordCtrl.value) {
      this.openSnack('رمز عبور و تکرار آن یکسان نیستند.', 'error');
      return;
    }

    const dob = this.getDateOnly(this.SecretaryDateOfBirthCtrl.value);
    const payload: RegisterUser = {
      email: this.SecretaryEmailCtrl.value,
      password: this.SecretaryPasswordCtrl.value,
      confirmPassword: this.SecretaryConfirmPasswordCtrl.value,
      gender: this.SecretaryGenderCtrl.value,
      dateOfBirth: dob,
      name: this.SecretaryNameCtrl.value,
      lastName: this.SecretaryLastNameCtrl.value,
      phoneNum: '98' + this.SecretaryPhoneNumCtrl.value
    };

    this.managerService.createSecretary(payload).subscribe({
      next: _ => {
        this.openSnack('منشی با موفقیت ثبت شد.', 'success');
        this.secFormDir?.resetForm();
        this.addSecretaryFg.reset();
      },
      error: err => {
        const msgs: string[] = Array.isArray(err?.error) ? err.error : (Array.isArray(err?.error?.errors) ? err.error.errors : []);
        if (msgs.length) this.applyServerErrorsToForm(msgs);
        this.openSnack('خطا در ثبت نام.', 'error');
      }
    });
  }
}