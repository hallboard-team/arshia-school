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
import { Subscription, take } from 'rxjs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { RegisterUser } from '../../models/register-user.model';
import { ManagerService } from '../../services/manager.service';
import { TeacherService } from '../../services/teacher.service';
import { SecretaryService } from '../../services/secretary.service';
import { MemberService } from '../../services/member.service';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { UserWithRole } from '../../models/user-with-role.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ApiResponse } from '../../models/helpers/apiResponse.model';
import { AddCorse } from '../../models/add-corse.model';

@Component({
  selector: 'app-manageer-pannel',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule
  ],
  templateUrl: './manageer-pannel.component.html',
  styleUrl: './manageer-pannel.component.scss'
})
//Dont foget Implement ngOnInit and Destroy
export class ManageerPannelComponent implements OnInit, OnDestroy{
  //#region injects and vars
  teacherService = inject(TeacherService);
  secretaryService = inject(SecretaryService);
  memberService = inject(MemberService);
  accountService = inject(AccountService);
  managerService = inject(ManagerService);

  fb = inject(FormBuilder);
  private deleteSubscription: Subscription | undefined;

  minDate = new Date();
  maxDate = new Date();

  passowrdsNotMatch: boolean | undefined;
  emailExistsError: string | undefined;
  loggedInUser: LoggedInUser | null | undefined;
  //for get-users-with-role
  displayedColumns = ['no', 'username', 'active-roles', 'delete-user'];
  usersWithRoles: UserWithRole[] = [];
  private snackBar = inject(MatSnackBar);


  //#endregion injects and vars

  //#region auto-run methods

  constructor() {
    this.loggedInUser = this.accountService.loggedInUserSig();
  }

  ngOnInit(): void {
    this.showAllUsersWithRoles();

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 99, 0, 1); // not older than 99 years
    this.maxDate = new Date(currentYear - 15, 0, 1); // not earlier than 15 years
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }
  //#endregion auto-run methods

  //#region FormGroup
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

   addTeacherFg = this.fb.group({
    emailTeacherCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]], // Use / instead of ' around RegEx
    userNameTeacherCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    passwordTeacherCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordTeacherCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameTeacherCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameTeacherCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    dateOfBirthTeacherCtrl: ['', [Validators.required]],
    genderTeacherCtrl: ['female', [Validators.required]],
    phoneNumTeacherCtrl: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    lessonTeacherCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
   })

   addSecretaryFg = this.fb.group({
    emailSecCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]], // Use / instead of ' around RegEx
    userNameSecCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    passwordSecCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordSecCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    nameSecCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastNameSecCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    dateOfBirthSecCtrl: ['', [Validators.required]],
    genderSecCtrl: ['female', [Validators.required]],
    phoneNumSecCtrl: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    lessonSecCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
   })

   addCorseFg = this.fb.group({
    userNameCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    darsCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    tedadeKoleGhesdHaCtrl: ['', [Validators.required]],
    shahriyeCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]]
   })
  //#endregion FormGroup

  // #region GeterFormGroup
  //for student
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

  //for Teacher
  get GenderTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('genderTeacherCtrl') as FormControl;
  }
  get EmailTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('emailTeacherCtrl') as FormControl;
  }
  get UserNameTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('userNameTeacherCtrl') as FormControl;
  }
  get PasswordTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('passwordTeacherCtrl') as FormControl;
  }
  get ConfirmPasswordTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('confirmPasswordTeacherCtrl') as FormControl;
  }
  get NameTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('nameTeacherCtrl') as FormControl;
  }
  get LastNameTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('lastNameTeacherCtrl') as FormControl;
  }
  get PhoneNumTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('phoneNumTeacherCtrl') as FormControl;
  }
  get DateOfBirthTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('dateOfBirthTeacherCtrl') as FormControl;
  }
  get LessonTeacherCtrl(): FormControl {
    return this.addTeacherFg.get('lessonTeacherCtrl') as FormControl;
  }

  //for secretary
  get GenderSecCtrl(): FormControl {
    return this.addSecretaryFg.get('genderSecCtrl') as FormControl;
  }
  get EmailSecCtrl(): FormControl {
    return this.addSecretaryFg.get('emailSecCtrl') as FormControl;
  }
  get UserNameSecCtrl(): FormControl {
    return this.addSecretaryFg.get('userNameSecCtrl') as FormControl;
  }
  get PasswordSecCtrl(): FormControl {
    return this.addSecretaryFg.get('passwordSecCtrl') as FormControl;
  }
  get ConfirmPasswordSecCtrl(): FormControl {
    return this.addSecretaryFg.get('confirmPasswordSecCtrl') as FormControl;
  }
  get NameSecCtrl(): FormControl {
    return this.addSecretaryFg.get('nameSecCtrl') as FormControl;
  }
  get LastNameSecCtrl(): FormControl {
    return this.addSecretaryFg.get('lastNameSecCtrl') as FormControl;
  }
  get PhoneNumSecCtrl(): FormControl {
    return this.addSecretaryFg.get('phoneNumSecCtrl') as FormControl;
  }
  get DateOfBirthSecCtrl(): FormControl {
    return this.addSecretaryFg.get('dateOfBirthSecCtrl') as FormControl;
  }
  get LessonSecCtrl(): FormControl {
    return this.addSecretaryFg.get('lessonSecCtrl') as FormControl;
  }

  //for add-corse
  get UserNameCtrl(): FormControl {
    return this.addCorseFg.get('userNameCtrl') as FormControl;
  }
  get DarsCtrl(): FormControl {
    return this.addCorseFg.get('darsCtrl') as FormControl;
  }
  get TedadeKoleGhesdHaCtrl(): FormControl {
    return this.addCorseFg.get('tedadeKoleGhesdHaCtrl') as FormControl;
  }
  get ShahriyeCtrl(): FormControl {
    return this.addCorseFg.get('shahriyeCtrl') as FormControl;
  }
  // #endregion GeterFormGroup

  //#region Methods

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

      this.memberService.registerStudent(registerUser).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
    }
    else {
      this.passowrdsNotMatch = true;
    }
  }

  addSecretary(): void {
   const dob: string | undefined = this.getDateOnly(this.DateOfBirthSecCtrl.value);

   if (this.PasswordSecCtrl.value === this.ConfirmPasswordSecCtrl.value) {
     this.passowrdsNotMatch = false;

     let registerUser: RegisterUser = {
       email: this.EmailSecCtrl.value,
       userName: this.UserNameSecCtrl.value,
       password: this.PasswordSecCtrl.value,
       confirmPassword: this.ConfirmPasswordSecCtrl.value,
       gender: this.GenderSecCtrl.value,
       dateOfBirth: dob,
       name: this.NameSecCtrl.value,
       lastName: this.LastNameSecCtrl.value,
       phoneNum: this.PhoneNumSecCtrl.value,
       lesson: this.LessonSecCtrl.value
     }

    this.secretaryService.registerSecretary(registerUser).subscribe({
       next: user => console.log(user),
       error: err => this.emailExistsError = err.error
     });
   }
   else {
     this.passowrdsNotMatch = true;
   }
  }
  
  addTeacher(): void {
   const dob: string | undefined = this.getDateOnly(this.DateOfBirthTeacherCtrl.value);

   if (this.PasswordTeacherCtrl.value === this.ConfirmPasswordTeacherCtrl.value) {
     this.passowrdsNotMatch = false;

     let registerUser: RegisterUser = {
       email: this.EmailTeacherCtrl.value,
       userName: this.UserNameTeacherCtrl.value,
       password: this.PasswordTeacherCtrl.value,
       confirmPassword: this.ConfirmPasswordTeacherCtrl.value,
       gender: this.GenderTeacherCtrl.value,
       dateOfBirth: dob,
       name: this.NameTeacherCtrl.value,
       lastName: this.LastNameTeacherCtrl.value,
       phoneNum: this.PhoneNumTeacherCtrl.value,
       lesson: this.LessonTeacherCtrl.value
     }

     this.teacherService.registerTeacher(registerUser).subscribe({
       next: user => console.log(user),
       error: err => this.emailExistsError = err.error
     });
   }
   else {
     this.passowrdsNotMatch = true;
   }
  }

  addCorse(): void {
    if (this.UserNameCtrl)
    {
      let addCorse: AddCorse = {
        userName: this.UserNameCtrl.value,
        dars: this.DarsCtrl.value,
        tedadeKoleGhesdHa: this.TedadeKoleGhesdHaCtrl.value,
        shahriye: this.ShahriyeCtrl.value
      }
      this.managerService.addCorse(addCorse).subscribe({
        next: user => console.log(user),
        error: err => this.emailExistsError = err.error
      });
      
    }
    else {
      return console.log("userName has error");
    }
  }

  showAllUsersWithRoles(): void {
    this.managerService.getUsersWithRoles()
      .pipe(
        take(1)
      ).subscribe({
        next: users => this.usersWithRoles = users
      });
  }

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