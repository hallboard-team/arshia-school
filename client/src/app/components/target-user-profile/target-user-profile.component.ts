import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ManagerService } from '../../services/manager.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TargetUserProfile } from '../../models/target-user-profile.model';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member } from '../../models/member.model';
import { ManagerUpdateMemberDto } from '../../models/manager-update-member.model';
import { Subscription, take } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddEnrolledCourse } from '../../models/add-enrolled-course.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { NavbarComponent } from '../navbar/navbar.component';
import { Course, ShowCourse } from '../../models/course.model';
import { UpdateEnrolledCourse } from '../../models/update-enrolled-course.model';
import { CourseParams } from '../../models/helpers/course-params';
import { CourseService } from '../../services/course.service';
import { PaginatedResult } from '../../models/helpers/paginatedResult';
import { PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../models/helpers/pagination';
import moment from 'moment-jalaali';
import { CurrencyFormatterDirective } from '../../directives/currency-formatter.directive';
import { defaultTheme, IDatepickerTheme, NgPersianDatepickerModule } from '../../../../projects/ng-persian-datepicker/src/public-api';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });
@Component({
  selector: 'app-target-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, AutoFocusDirective,
    MatInputModule, MatButtonModule, NavbarComponent,
    RouterModule, MatTabsModule, MatNativeDateModule,
    MatRadioModule, MatSnackBarModule, MatDatepickerModule,
    MatSelectModule, CurrencyFormatterDirective,
    NgPersianDatepickerModule
  ],
  templateUrl: './target-user-profile.component.html',
  styleUrl: './target-user-profile.component.scss'
})
export class TargetUserProfileComponent implements OnInit {
  private _managerService = inject(ManagerService);
  private _courseService = inject(CourseService);
  private _route = inject(ActivatedRoute);
  private _fb = inject(FormBuilder);
  private _matSnackBar = inject(MatSnackBar);
  private _platformId = inject(PLATFORM_ID);

  targetUserProfile: TargetUserProfile | null = null;
  courses: Course[] | null = [];
  shamsiCourses: (Course & { shamsiStart: string })[] = [];
  courseTitles: string[] | null = [];
  member: Member | undefined;

  showCourses: ShowCourse[] | undefined;
  courseParams: CourseParams | undefined;
  subscribed: Subscription | undefined;

  loading: boolean = true;
  error: string | null = null;
  minDate = new Date();
  maxDate = new Date();
  fb = inject(FormBuilder);
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;
  pagination: Pagination | undefined;

  uiIsVisible: boolean = true;
  uiTheme: IDatepickerTheme = defaultTheme;
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  shamsiDisplayDate: string = '';

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 99, 0, 1);
    this.maxDate = new Date(currentYear - 15, 0, 1);

    this.getTargetUserProfile();
    this.getTargetUserCourse();
    this.getTargetCourseTitles();
    this.courseParams = new CourseParams();

    this.getAll();
  }

  targetMemberEditFg: FormGroup = this._fb.group({
    targetEmailCtrl: ['', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$/)
    ]],
    targetNameCtrl: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30)
    ]],
    targetLastNameCtrl: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30)
    ]],
    targetPhoneNumCtrl: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]],
    targetGenderCtrl: ['', Validators.required],
    targetDateOfBirthCtrl: ['', Validators.required]
  });

  addEnrolledCourseFg: FormGroup = this.fb.group({
    titleCourseCtrl: ['', Validators.required],
    numberOfPaymentsCtrl: ['', [Validators.required]],
    paidAmountCtrl: ['', [Validators.required]]
  })

  updateEnrolledCourseFg: FormGroup = this.fb.group({
    titleCourseUpdateCtrl: ['', Validators.required],
    paidAmountUpdateCtrl: ['', [Validators.required]],
    methodCtrl: ['', [Validators.required]]
  })

  get TargetEmailCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetEmailCtrl') as FormControl;
  }
  get TargetNameCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetNameCtrl') as FormControl;
  }
  get TargetLastNameCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetLastNameCtrl') as FormControl;
  }
  get TargetPhoneNumCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetPhoneNumCtrl') as FormControl;
  }
  get TargetGenderCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetGenderCtrl') as FormControl;
  }
  get TargetDateOfBirthCtrl(): AbstractControl {
    return this.targetMemberEditFg.get('targetDateOfBirthCtrl') as FormControl;
  }

  //add enrolled-course
  get TitleCourseCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('titleCourseCtrl') as FormControl;
  }
  get NumberOfPaymentsCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('numberOfPaymentsCtrl') as FormControl;
  }
  get PaidAmountCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('paidAmountCtrl') as FormControl;
  }

  //update enrolled-course
  get TitleCourseUpdateCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('titleCourseUpdateCtrl') as FormControl;
  }
  get PaidAmountUpdateCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('paidAmountUpdateCtrl') as FormControl;
  }
  get MethodCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('methodCtrl') as FormControl;
  }

  getTargetUserProfile(): void {
    if (isPlatformBrowser(this._platformId)) {
      const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

      if (memberUserName) {
        this._managerService.getMemberByUserName(memberUserName).subscribe({
          next: (data) => {
            this.targetUserProfile = data;
            this.initTargetControllersValues(data);
            this.loading = false;
          },
          error: (err) => {
            this.error = 'خطا در بارگذاری پروفایل. لطفاً دوباره تلاش کنید.';
            this.loading = false;
          }
        });
      }
    }
  }

  getTargetUserCourse(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    if (memberUserName) {
      this._managerService.getTargetUserCourses(memberUserName).subscribe({
        next: (data) => {
          this.courses = data;
          if (data !== null) {
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
  }

  getTargetCourseTitles(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    if (memberUserName) {
      this._managerService.getTargetCourseTitles(memberUserName).subscribe({
        next: (data) => {
          this.courseTitles = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'خطا در بارگذاری اسم دوره ها لطفا دوباره تلاش کنید.';
          this.loading = false;
        }
      })
    }
  }

  initTargetControllersValues(targetUserProfile: TargetUserProfile) {
    this.TargetEmailCtrl.setValue(targetUserProfile.email);
    this.TargetNameCtrl.setValue(targetUserProfile.name);
    this.TargetLastNameCtrl.setValue(targetUserProfile.lastName);
    this.TargetPhoneNumCtrl.setValue(targetUserProfile.phoneNum?.slice(2));
    this.TargetGenderCtrl.setValue(targetUserProfile.gender);

    this.TargetDateOfBirthCtrl.setValue(targetUserProfile.dateOfBirth);
    this.shamsiDisplayDate = moment(targetUserProfile.dateOfBirth).format('jYYYY/jMM/jDD');
  }

  updateTargetMember() {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    if (memberUserName) {
      const dob: string | undefined = this.getDateOnly(this.TargetDateOfBirthCtrl.value);

      let managerUpdateMember: ManagerUpdateMemberDto = {
        email: this.TargetEmailCtrl.value,
        name: this.TargetNameCtrl.value,
        lastName: this.TargetLastNameCtrl.value,
        phoneNum: '98' + this.TargetPhoneNumCtrl.value,
        gender: this.TargetGenderCtrl.value,
        dateOfBirth: dob,
      }

      this._managerService.updateMember(managerUpdateMember, memberUserName)
        .pipe(take(1)).subscribe({
          next: data => {
            this._matSnackBar.open("آپدیت با موفقیت ثبت شد", "Close", {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 10000
            });
            this.targetUserProfile = data;
          },
          error: err => {
            this._matSnackBar.open("در انجام آپدیت خطا پیش آمده", "Close", {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 10000
            });
          }
        });
    }
  }

  addEnrolledCourse(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    if (memberUserName) {
      let addEnrolledCourse: AddEnrolledCourse = {
        titleCourse: this.TitleCourseCtrl.value,
        numberOfPayments: this.NumberOfPaymentsCtrl.value,
        paidAmount: this.PaidAmountCtrl.value
      }

      this._managerService.addEnrolledCourse(memberUserName, addEnrolledCourse).subscribe({
        next: (response) => {
          this._matSnackBar.open("اضافه کردن دوره با موفقیت انجام شد", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });

          this.getTargetUserCourse();
          this.getTargetCourseTitles();
        },
        error: (err) => {
          this._matSnackBar.open("در اضافه کردن دوره مشکل به وجود آمده", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
        }
      })
    }
  }

  updateEnrolledCourse(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    if (memberUserName) {
      let updateEnrolledCourse: UpdateEnrolledCourse = {
        titleCourse: this.TitleCourseUpdateCtrl.value,
        paidAmount: this.PaidAmountUpdateCtrl.value,
        method: this.MethodCtrl.value
      }

      this._managerService.updateEnrolledCourse(memberUserName, updateEnrolledCourse).subscribe({
        next: (response) => {
          this._matSnackBar.open("پرداخت شهریه با موفقیت ثبت شد", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
        },
        error: (err) => {
          this._matSnackBar.open("در پرداخت شهریه مشکلی پیش آمده", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
        }
      })
    }
  }

  getAll(): void {
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

  handlePageEvent(e: PageEvent) {
    if (this.courseParams) {
      if (e.pageSize !== this.courseParams.pageSize)
        e.pageIndex = 0;

      this.pageEvent = e;
      this.courseParams.pageSize = e.pageSize;
      this.courseParams.pageNumber = e.pageIndex + 1;

      this.getAll();
    }
  }

  openDatePicker() {
    const elements = document.querySelectorAll('.div-background-date-picker');
    const buttonClose = document.querySelectorAll('.close-date');
    const buttonOpen = document.querySelectorAll('.open-date');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    buttonClose.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    buttonOpen.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
  }

  closeDatePicker() {
    const elements = document.querySelectorAll('.div-background-date-picker');
    const buttonClose = document.querySelectorAll('.close-date');
    const buttonOpen = document.querySelectorAll('.open-date');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    buttonClose.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    buttonOpen.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });
  }

  onDateSelect(event: { shamsi: string; gregorian: string; timestamp: number }): void {
    this.shamsiDisplayDate = event.shamsi;
    this.TargetDateOfBirthCtrl.setValue(new Date(event.gregorian));
    this.closeDatePicker();
  }

  private getDateOnly(dob: string | null): string | undefined {
    if (!dob) return undefined;

    let theDob: Date = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}