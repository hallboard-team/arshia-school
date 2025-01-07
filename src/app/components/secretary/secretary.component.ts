import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { SecretaryService } from '../../services/secretary.service';
import { Subscription } from 'rxjs';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { RegisterUser } from '../../models/register-user.model';

@Component({
  selector: 'app-secretary',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective
  ],
  templateUrl: './secretary.component.html',
  styleUrl: './secretary.component.scss'
})
export class SecretaryComponent {
  secretaryService = inject(SecretaryService);
  accountService = inject(AccountService);
  
  private deleteSubscription: Subscription | undefined;

  fb = inject(FormBuilder);

  minDate = new Date();
  maxDate = new Date();

  passowrdsNotMatch: boolean | undefined;
  emailExistsError: string | undefined;
  loggedInUser: LoggedInUser | null | undefined;

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

  addStudentFg = this.fb.group({
    emailStudentCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]], // Use / instead of ' around RegEx
    userNameStudentCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    passwordStudentCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordStudentCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameStudentCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameStudentCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    dateOfBirthStudentCtrl: ['', [Validators.required]],
    genderStudentCtrl: ['female', [Validators.required]],
    phoneNumStudentCtrl: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    lessonStudentCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
  })

  get GenderStudentCtrl(): FormControl {
    return this.addStudentFg.get('genderStudentCtrl') as FormControl;
  }
  get EmailStudentCtrl(): FormControl {
    return this.addStudentFg.get('emailStudentCtrl') as FormControl;
  }
  get UserNameStudentCtrl(): FormControl {
    return this.addStudentFg.get('userNameStudentCtrl') as FormControl;
  }
  get PasswordStudentCtrl(): FormControl {
    return this.addStudentFg.get('passwordStudentCtrl') as FormControl;
  }
  get ConfirmPasswordStudentCtrl(): FormControl {
    return this.addStudentFg.get('confirmPasswordStudentCtrl') as FormControl;
  }
  get NameStudentCtrl(): FormControl {
    return this.addStudentFg.get('nameStudentCtrl') as FormControl;
  }
  get LastNameStudentCtrl(): FormControl {
    return this.addStudentFg.get('nameStudentCtrl') as FormControl;
  }
  get PhoneNumStudentCtrl(): FormControl {
    return this.addStudentFg.get('phoneNumStudentCtrl') as FormControl;
  }
  get DateOfBirthStudentCtrl(): FormControl {
    return this.addStudentFg.get('dateOfBirthStudentCtrl') as FormControl;
  }
  get LessonStudentCtrl(): FormControl {
    return this.addStudentFg.get('lessonStudentCtrl') as FormControl;
  }

  addStudent(): void {
    const dob: string | undefined = this.getDateOnly(this.DateOfBirthStudentCtrl.value);

    if (this.PasswordStudentCtrl.value === this.ConfirmPasswordStudentCtrl.value) {
      this.passowrdsNotMatch = false;

      let registerUser: RegisterUser = {
        email: this.EmailStudentCtrl.value,
        userName: this.UserNameStudentCtrl.value,
        password: this.PasswordStudentCtrl.value,
        confirmPassword: this.ConfirmPasswordStudentCtrl.value,
        gender: this.GenderStudentCtrl.value,
        dateOfBirth: dob,
        name: this.NameStudentCtrl.value,
        lastName: this.LastNameStudentCtrl.value,
        phoneNum: this.PhoneNumStudentCtrl.value,
        lesson: this.LessonStudentCtrl.value
      }

      this.secretaryService.addStudent(registerUser).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
    }
    else {
      this.passowrdsNotMatch = true;
    }
  }

  private getDateOnly(dob: string | null): string | undefined {
    if (!dob) return undefined;

    let theDob: Date = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}