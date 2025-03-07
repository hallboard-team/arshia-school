import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { MemberService } from '../../../services/member.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, take } from 'rxjs';
import { Member, ShowMember } from '../../../models/member.model';
import { UserProfile } from '../../../models/user-profile.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { jwtInterceptor } from '../../../interceptors/jwt.interceptor';
import { HashedUserId } from '../../../models/helpers/hashed-user-id.model';
import { Course } from '../../../models/course.model';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MemberUpdate } from '../../../models/member-update.model';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, AutoFocusDirective,
    MatInputModule, MatButtonModule, NavbarComponent,
    RouterModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit{
  private _accountService = inject(AccountService);
  private _memberService = inject(MemberService);
  private _matSnackBar = inject(MatSnackBar);
  private _platformId = inject(PLATFORM_ID);
  private _fb = inject(FormBuilder);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  profile: UserProfile | null = null;
  courses: Course[] = [];
  loading: boolean = true;
  error: string | null = null;
  // member: ShowMember | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    this.getProfile();
    // this.getCourse();

    // this.memberEditFg = this._fb.group({
    //   emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    //   userNameCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    //   currentPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    //   passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    //   confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
    // });
  }

  memberEditFg: FormGroup = this._fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    userNameCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    currentPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
  });

  get EmailCtrl(): AbstractControl {
    return this.memberEditFg.get('emailCtrl') as FormControl;
  }
  get UserNameCtrl(): AbstractControl {
    return this.memberEditFg.get('userNameCtrl') as FormControl;
  }
  get CurrentPasswordCtrl(): AbstractControl {
    return this.memberEditFg.get('currentPasswordCtrl') as FormControl;
  }
  get PasswordCtrl(): AbstractControl {
    return this.memberEditFg.get('passwordCtrl') as FormControl;
  }
  get ConfirmPasswordCtrl(): AbstractControl {
    return this.memberEditFg.get('confirmPasswordCtrl') as FormControl;
  }

  getProfile(): void {
    this._memberService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;  // ذخیره داده‌ها در متغیر پروفایل
        this.loading = false;  // پایان لود

        // if(this.profile) {
        //   this.memberEditFg.patchValue({
        //     emailCtrl: this.profile.email || '',
        //     userNameCtrl: this.profile.userName || '',
        //     currentPasswordCtrl: '',
        //     passwordCtrl: '',
        //     confirmPasswordCtrl: ''
        //   })
        // }
      },
      error: (err) => {
        this.error = 'خطا در بارگذاری پروفایل. لطفاً دوباره تلاش کنید.';  // خطا در صورت مشکل
        this.loading = false;  // پایان لود
      }
    });
  }

  getCourse(): void {
    this._memberService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'خطا در بارگذاری دوره ها لطفا دوباره تلاش کنید.';
        this.loading = false;
      }
    })
  }

  initControllersValues(showMember: ShowMember) {
    this.EmailCtrl.setValue(showMember.email);
    this.UserNameCtrl.setValue(showMember.userName);
    this.CurrentPasswordCtrl.setValue(showMember.currentPassword);
    this.PasswordCtrl.setValue(showMember.password);
    this.ConfirmPasswordCtrl.setValue(showMember.confirmPasword);
  }

  updateMember(): void {
    if (this.profile) {
      let updatedMember: MemberUpdate = {
        email: this.EmailCtrl.value,
        userName: this.UserNameCtrl.value,
        currentPassword: this.CurrentPasswordCtrl.value,
        password: this.PasswordCtrl.value,
        confirmPassword: this.ConfirmPasswordCtrl.value
      }

      this._memberService.updateUser(updatedMember)
        .pipe(take(1))
        .subscribe({
          next: (response: ApiResponse) => {
            if (response.message) {
              this._matSnackBar.open("پروفایل شما با موفقیت آپدیت شد", "Close", {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 10000
              });
            }
            // if (this.profile) {
            //   let userProfile: UserProfile = {
            //     email: this.profile?.email,
            //     userName: this.profile.userName,
            //     phoneNum: this.profile.phoneNum,
            //     name: this.profile.name,
            //     lastName: this.profile.lastName,
            //     age: this.profile.age,
            //     gender: this.profile.gender,
            //     enrolledCourses: this.profile.enrolledCourses
            //   }

            //   this.profile = userProfile;
            // }
          }
        });

      // this.memberEditFg.markAsPristine();
    }
  }

  openEditProfile() {
    const elements = document.querySelectorAll('.div-edit-profile'); 

    elements.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const courseContainer = document.querySelectorAll('.course-container'); 

    courseContainer.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const title = document.querySelectorAll('.div-title-course'); 

    title.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });


    const loading = document.querySelectorAll('.loading'); 

    loading.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });
  }

  closeEditProfile() {
    const elements = document.querySelectorAll('.div-edit-profile'); 

    elements.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const courseContainer = document.querySelectorAll('.course-container'); 

    courseContainer.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const title = document.querySelectorAll('.div-title-course'); 

    title.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });


    const loading = document.querySelectorAll('.loading'); 

    loading.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });
  }

  openCourseList() {
    this.getCourse();

    const titleCourse = document.querySelectorAll('.div-title-course'); 

    titleCourse.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const courseContainer = document.querySelectorAll('.course-container'); 

    courseContainer.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const loadingCourse = document.querySelectorAll('.loading'); 

    loadingCourse.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const openCourseListButton = document.querySelectorAll('.div-click-button-show-course'); 

    openCourseListButton.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const closeCourseListButton = document.querySelectorAll('.div-btn-exit-course-list'); 

    closeCourseListButton.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });
  }

  closeCourseList() {
    const titleCourse = document.querySelectorAll('.div-title-course'); 

    titleCourse.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const courseContainer = document.querySelectorAll('.course-container'); 

    courseContainer.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const loadingCourse = document.querySelectorAll('.loading'); 

    loadingCourse.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });

    const openCourseListButton = document.querySelectorAll('.div-click-button-show-course'); 

    openCourseListButton.forEach((element) => { 
      (element as HTMLElement).style.display = "flex";
    });

    const closeCourseListButton = document.querySelectorAll('.div-btn-exit-course-list'); 

    closeCourseListButton.forEach((element) => { 
      (element as HTMLElement).style.display = "none";
    });
  }
}