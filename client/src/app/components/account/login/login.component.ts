import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginUser } from '../../../models/login-user.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { AccountService } from '../../../services/account.service';
import { MatTabsModule } from '@angular/material/tabs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, AutoFocusDirective, MatTabsModule,
    NavbarComponent, MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  accountService = inject(AccountService);
  fb = inject(FormBuilder);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  wrongUsernameOrPassword: string | undefined;
  hidePassword: boolean = true;

  loginFg: FormGroup = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
  })

  get EmailCtrl(): FormControl {
    return this.loginFg.get('emailCtrl') as FormControl;
  }

  get PasswordCtrl(): FormControl {
    return this.loginFg.get('passwordCtrl') as FormControl;
  }

  login(): void {
    let loginUser: LoginUser = {
      email: this.EmailCtrl.value,
      password: this.PasswordCtrl.value
    }

    this.accountService.loginUser(loginUser).subscribe({
      next: (loggedInUser: LoggedInUser | null) => {
        console.log('Logged in as:', loggedInUser?.userName);
      },
      error: err => {
        let msg = err?.error?.message ?? err?.error;

        if (msg === 'Wrong email or password') {
          msg = 'ایمیل یا رمز عبور نادرست است';
        }

        msg ||= 'خطا در ورود، دوباره تلاش کنید';

        this.wrongUsernameOrPassword = err.error;

        this.snack.open(msg, 'باشه', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snack-error'],
          direction: 'rtl'
        });
      }
    })
  }
}