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

@Component({
  selector: 'app-manageer-pannel',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule, MatRadioModule,
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule, NavbarComponent
  ],
  templateUrl: './manageer-pannel.component.html',
  styleUrl: './manageer-pannel.component.scss'
})
//Dont foget Implement ngOnInit and Destroy
export class ManageerPannelComponent implements OnInit, OnDestroy {
  accountService = inject(AccountService);
  managerService = inject(ManagerService);

  fb = inject(FormBuilder);
  private deleteSubscription: Subscription | undefined;

  minDate = new Date();
  maxDate = new Date();

  passowrdsNotMatch: boolean | undefined;
  emailExistsError: string | undefined;
  loggedInUser: LoggedInUser | null | undefined;
  private snackBar = inject(MatSnackBar);

  //#region auto-run methods
  constructor() {
    this.loggedInUser = this.accountService.loggedInUserSig();
  }

  ngOnInit(): void {
    // this.showAllUsersWithRoles();

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 99, 0, 1); // not older than 99 years
    this.maxDate = new Date(currentYear - 15, 0, 1); // not earlier than 15 years
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }
  //#endregion auto-run methods

  addMemberFg = this.fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phoneNumCtrl: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    dateOfBirthCtrl: ['', [Validators.required]],
    genderCtrl: ['', [Validators.required]]
  })

  get GenderCtrl(): FormControl {
    return this.addMemberFg.get('genderCtrl') as FormControl;
  }
  get EmailCtrl(): FormControl {
    return this.addMemberFg.get('emailCtrl') as FormControl;
  }
  get PasswordCtrl(): FormControl {
    return this.addMemberFg.get('passwordCtrl') as FormControl;
  }
  get ConfirmPasswordCtrl(): FormControl {
    return this.addMemberFg.get('confirmPasswordCtrl') as FormControl;
  }
  get NameCtrl(): FormControl {
    return this.addMemberFg.get('nameCtrl') as FormControl;
  }
  get LastNameCtrl(): FormControl {
    return this.addMemberFg.get('lastNameCtrl') as FormControl;
  }
  get PhoneNumCtrl(): FormControl {
    return this.addMemberFg.get('phoneNumCtrl') as FormControl;
  }
  get DateOfBirthCtrl(): FormControl {
    return this.addMemberFg.get('dateOfBirthCtrl') as FormControl;
  }

  addStudent(): void {
    const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);

    if (this.PasswordCtrl.value === this.ConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = false;

      let registerUser: RegisterUser = {
        email: this.EmailCtrl.value,
        password: this.PasswordCtrl.value,
        confirmPassword: this.ConfirmPasswordCtrl.value,
        gender: this.GenderCtrl.value,
        dateOfBirth: dob,
        name: this.NameCtrl.value,
        lastName: this.LastNameCtrl.value,
        phoneNum: this.PhoneNumCtrl.value
      }

      this.managerService.createStudent(registerUser).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
    }
    else {
      this.passowrdsNotMatch = true;
    }
  }

  addSecretary(): void {
    const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);

    if (this.PasswordCtrl.value === this.ConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = false;

      let registerUser: RegisterUser = {
        email: this.EmailCtrl.value,
        password: this.PasswordCtrl.value,
        confirmPassword: this.ConfirmPasswordCtrl.value,
        gender: this.GenderCtrl.value,
        dateOfBirth: dob,
        name: this.NameCtrl.value,
        lastName: this.LastNameCtrl.value,
        phoneNum: this.PhoneNumCtrl.value
      }

      this.managerService.createSecretary(registerUser).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
    }
    else {
      this.passowrdsNotMatch = true;
    }
  }

  addTeacher(): void {
    const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);

    if (this.PasswordCtrl.value === this.ConfirmPasswordCtrl.value) {
      this.passowrdsNotMatch = false;

      let registerUser: RegisterUser = {
        email: this.EmailCtrl.value,
        password: this.PasswordCtrl.value,
        confirmPassword: this.ConfirmPasswordCtrl.value,
        gender: this.GenderCtrl.value,
        dateOfBirth: dob,
        name: this.NameCtrl.value,
        lastName: this.LastNameCtrl.value,
        phoneNum: this.PhoneNumCtrl.value
      }

      this.managerService.createTeacher(registerUser).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
    }
    else {
      this.passowrdsNotMatch = true;
    }
  }

  // showAllUsersWithRoles(): void {
  //   this.managerService.getUsersWithRoles()
  //     .pipe(
  //       take(1)
  //     ).subscribe({
  //       next: users => this.usersWithRoles = users
  //     });
  // }

  // deleteUser(i: number, userName: string): void {
  //   this.deleteSubscription = this.managerService.deleteUser(userName)
  //     .subscribe({
  //       next: (response: ApiResponse) => {
  //         this.snackBar.open(response.message, "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 });

  //         if (this.usersWithRoles)
  //           this.usersWithRoles = [
  //             ...this.usersWithRoles.slice(0, i),
  //             ...this.usersWithRoles.slice(i + 1)
  //           ];
  //       }
  //     }
  //     );
  // }

  private getDateOnly(dob: string | null): string | undefined {
    if (!dob) return undefined;

    let theDob: Date = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}