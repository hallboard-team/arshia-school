import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { MemberService } from '../../../services/member.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, take } from 'rxjs';
import { Member, ShowMember } from '../../../models/member.model';
import { UserProfile } from '../../../models/user-profile.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { Course, ShowCourse } from '../../../models/course.model';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MemberUpdate } from '../../../models/member-update.model';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { ManagerService } from '../../../services/manager.service';
import { ManagerUpdateMemberDto } from '../../../models/manager-update-member.model';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AddEnrolledCourse } from '../../../models/add-enrolled-course.model';
import { MatSelectModule } from '@angular/material/select';
import { CourseParams } from '../../../models/helpers/course-params';
import { CourseService } from '../../../services/course.service';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import moment from 'moment-jalaali';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, AutoFocusDirective,
    MatInputModule, MatButtonModule, NavbarComponent,
    RouterModule, MatTabsModule, MatNativeDateModule,
    MatRadioModule, MatSnackBarModule, MatDatepickerModule,
    MatSelectModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private _accountService = inject(AccountService);
  private _memberService = inject(MemberService);
  private _courseService = inject(CourseService);
  private _managerService = inject(ManagerService);
  private _matSnackBar = inject(MatSnackBar);
  private _platformId = inject(PLATFORM_ID);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;
  shamsiCourses: (Course & { shamsiStart: string })[] = [];

  profile: UserProfile | null = null;
  courses: Course[] | null = [];
  loading: boolean = true;
  error: string | null = null;
  subscribed: Subscription | undefined;
  courseParams: CourseParams | undefined;
  pagination: Pagination | undefined;

  member: Member | undefined;
  showCourses: ShowCourse[] | undefined;

  minDate = new Date();
  maxDate = new Date();

  courseLoaded = false;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
    this.courseParams = new CourseParams();

    this.getProfile();
    // this.getLoggedInProfile();
    // this.getCourse();
    // this.getAllCours();
  }

  memberEditFg: FormGroup = this._fb.group({
    emailCtrl: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)]],
    // userNameCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
    currentPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    passwordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
    confirmPasswordCtrl: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]]
  });

  //geter for members
  get EmailCtrl(): AbstractControl {
    return this.memberEditFg.get('emailCtrl') as FormControl;
  }
  // get UserNameCtrl(): AbstractControl {
  //   return this.memberEditFg.get('userNameCtrl') as FormControl;
  // }
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
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'خطا در بارگذاری پروفایل. لطفاً دوباره تلاش کنید.';
        this.loading = false;
      }
    });
  }

  getCourse(): void {
    this._memberService.getCourses().subscribe({
      next: (data) => {
        if (data !== null) {
          this.courses = data;
          this.shamsiCourses = data.map(course => ({
            ...course,
            shamsiStart: moment(course.start).format('jYYYY/jMM/jDD')
          }));
        }
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
    // this.UserNameCtrl.setValue(showMember.userName);
    this.CurrentPasswordCtrl.setValue(showMember.currentPassword);
    this.PasswordCtrl.setValue(showMember.password);
    this.ConfirmPasswordCtrl.setValue(showMember.confirmPasword);
  }

  updateMember(): void {
    if (this.profile) {
      let updatedMember: MemberUpdate = {
        email: this.EmailCtrl.value,
        // userName: this.UserNameCtrl.value,
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
          }
        });
    }
  }

  getAllCours(): void {
    if (this.courseParams)
      this.subscribed = this._courseService.getAll(this.courseParams).subscribe({
        next: (response: PaginatedResult<ShowCourse[]>) => {
          if (response.body && response.pagination) {
            this.showCourses = response.body;
            this.pagination = response.pagination;
          }
        }
      });
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 1 && !this.courseLoaded && this.loggedInUserSig?.()?.roles?.includes('student')) {
      this.getCourse();
      this.courseLoaded = true;
    }
  }
}