import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { RegisterUser } from '../../models/register-user.model';
import { AccountService } from '../../services/account.service';
import { AdminService } from '../../services/admin.service';
import { MatTabsModule } from '@angular/material/tabs';
import { ManagerService } from '../../services/manager.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTabsModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
   //#region injects and vars
   adminService = inject(AdminService);
   fb = inject(FormBuilder);
 
   minDate = new Date();
   maxDate = new Date();
 
   passowrdsNotMatch: boolean | undefined;
   subscribedRegisterUser: Subscription | undefined;
   emailExistsError: string | undefined;
   //#endregion injects and vars
 
   //#region auto-run methods
   ngOnInit(): void {
     const currentYear = new Date().getFullYear();
     this.minDate = new Date(currentYear - 99, 0, 1); // not older than 99 years
     this.maxDate = new Date(currentYear - 15, 0, 1); // not earlier than 15 years
   }
 
   ngOnDestroy(): void {
     this.subscribedRegisterUser?.unsubscribe();
   }
   //#endregion auto-run methods
 
   //#region FormGroup
   addManagerFg = this.fb.group({
     emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]], // Use / instead of ' around RegEx
     userNameCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
     passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
     confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
     nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
     lastNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
     dateOfBirthCtrl: ['', [Validators.required]],
     genderCtrl: ['female', [Validators.required]],
     phoneNumCtrl: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
     lessonCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
    })
 
   get GenderCtrl(): FormControl {
     return this.addManagerFg.get('genderCtrl') as FormControl;
   }
   get EmailCtrl(): FormControl {
     return this.addManagerFg.get('emailCtrl') as FormControl;
   }
   get UserNameCtrl(): FormControl {
     return this.addManagerFg.get('userNameCtrl') as FormControl;
   }
   get PasswordCtrl(): FormControl {
     return this.addManagerFg.get('passwordCtrl') as FormControl;
   }
   get ConfirmPasswordCtrl(): FormControl {
     return this.addManagerFg.get('confirmPasswordCtrl') as FormControl;
   }
   get NameCtrl(): FormControl {
     return this.addManagerFg.get('nameCtrl') as FormControl;
   }
   get LastNameCtrl(): FormControl {
     return this.addManagerFg.get('nameCtrl') as FormControl;
   }
   get PhoneNumCtrl(): FormControl {
     return this.addManagerFg.get('phoneNumCtrl') as FormControl;
   }
   get DateOfBirthCtrl(): FormControl {
     return this.addManagerFg.get('dateOfBirthCtrl') as FormControl;
   }
   get LessonCtrl(): FormControl {
     return this.addManagerFg.get('lessonCtrl') as FormControl;
   }
   //#endregion FormGroup
 
   //#region Methods
 
   add(): void {
     const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);
 
     if (this.PasswordCtrl.value === this.ConfirmPasswordCtrl.value) {
       this.passowrdsNotMatch = false;
 
       let registerUser: RegisterUser = {
         email: this.EmailCtrl.value,
         userName: this.UserNameCtrl.value,
         password: this.PasswordCtrl.value,
         confirmPassword: this.ConfirmPasswordCtrl.value,
         gender: this.GenderCtrl.value,
         dateOfBirth: dob,
         name: this.NameCtrl.value,
         lastName: this.LastNameCtrl.value,
         phoneNum: this.PhoneNumCtrl.value,
         lesson: this.LessonCtrl.value
       }
 
       this.subscribedRegisterUser = this.adminService.addManager(registerUser).subscribe({
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