import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
// import { __importDefault } from 'tslib';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ManagerService } from '../../../services/manager.service';
import { ManagerUpdateMemberDto } from '../../../models/manager-update-member.model';
import { take } from 'rxjs';
import { Member } from '../../../models/member.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-edit-member',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule, NavbarComponent
  ],
  templateUrl: './edit-member.component.html',
  styleUrl: './edit-member.component.scss'
})
export class EditMemberComponent{
  // private _managerService = inject(ManagerService);
  // private _matSnackBar = inject(MatSnackBar);
  // private _fb = inject(FormBuilder);
  // private _route = inject(ActivatedRoute);
  // private _platformId = inject(PLATFORM_ID);

  // member: Member | undefined; 
  // minDate = new Date();
  // maxDate = new Date();

  // ngOnInit(): void {
  //   const currentYear = new Date().getFullYear();
  //   this.minDate = new Date(currentYear - 99, 0, 1); // not older than 99 years
  //   this.maxDate = new Date(currentYear - 15, 0, 1); // not earlier than 15 years

  //   this.getTargetMember();
  // }

  // memberEditFg: FormGroup = this._fb.group({
  //   emailCtrl: ['', ],
  //   userNameCtrl: ['', ],
  //   nameCtrl: ['', ],
  //   lastNameCtrl: ['', ],
  //   phoneNumCtrl: ['', ],
  //   genderCtrl: ['', ],
  //   dateOfBirthCtrl: ['', ]
  // });
    
  // get EmailCtrl(): AbstractControl {
  //   return this.memberEditFg.get('emailCtrl') as FormControl;
  // }
  // get UserNameCtrl(): AbstractControl {
  //   return this.memberEditFg.get('userNameCtrl') as FormControl;
  // }
  // get NameCtrl(): AbstractControl {
  //   return this.memberEditFg.get('nameCtrl') as FormControl;
  // }
  // get LastNameCtrl(): AbstractControl {
  //   return this.memberEditFg.get('lastNameCtrl') as FormControl;
  // }
  // get PhoneNumCtrl(): AbstractControl {
  //   return this.memberEditFg.get('phoneNumCtrl') as FormControl;
  // }
  // get GenderCtrl(): AbstractControl {
  //   return this.memberEditFg.get('genderCtrl') as FormControl;
  // }
  // get DateOfBirthCtrl(): AbstractControl {
  //   return this.memberEditFg.get('dateOfBirthCtrl') as FormControl;
  // }

  // getTargetMember(): void {
  //   if (isPlatformBrowser(this._platformId)) {
  //     const memberEmail: string | null = this._route.snapshot.paramMap.get('memberEmail');
  
  //     if (memberEmail) {
  //       this._managerService.getMemberByEmail(memberEmail)?.pipe(take(1)).subscribe(member => {
  //         if (member) {
  //           this.member = member;
  
  //           this.initControllersValues(member);
  //         }
  //       });
  //     }
  //   }
  // }

  // initControllersValues(member: Member) {
  //   this.EmailCtrl.setValue(member.email);
  //   this.UserNameCtrl.setValue(member.userName);
  //   this.NameCtrl.setValue(member.name);
  //   this.LastNameCtrl.setValue(member.lastName);
  //   this.PhoneNumCtrl.setValue(member.phoneNum);
  //   this.GenderCtrl.setValue(member.gender);
  //   this.DateOfBirthCtrl.setValue(member.age);
  // }

  // updateUser() {
  //   const memberEmail: string | null = this._route.snapshot.paramMap.get('memberEmail');
   
  //   if (memberEmail) {
  //     const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);

  //     let managerUpdateMember: ManagerUpdateMemberDto = {
  //       email: this.EmailCtrl.value,
  //       userName: this.UserNameCtrl.value,
  //       name: this.NameCtrl.value,
  //       lastName: this.LastNameCtrl.value,
  //       phoneNum: this.PhoneNumCtrl.value,
  //       gender: this.GenderCtrl.value,
  //       dateOfBirth: dob,
  //     }
         
  //     this._managerService.updateMember(managerUpdateMember, memberEmail)
  //       .pipe(take(1)).subscribe({
  //         next: response => {
  //           this._matSnackBar.open("آپدیت با موفقیت ثبت شد", "Close", {
  //             horizontalPosition: 'center',
  //             verticalPosition: 'bottom',
  //             duration: 10000
  //           });
  //         },
  //         error: err => {
  //           this._matSnackBar.open("در انجام آپدیت خطا پیش آمده", "Close", {
  //             horizontalPosition: 'center',
  //             verticalPosition: 'bottom',
  //             duration: 10000
  //           });
  //         }
  //       });
  //   }
  // }

  // private getDateOnly(dob: string | null): string | undefined {
  //   if (!dob) return undefined;

  //   let theDob: Date = new Date(dob);
  //   return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  // }
}