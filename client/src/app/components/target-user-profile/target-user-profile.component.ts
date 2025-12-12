import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ManagerService } from '../../services/manager.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TargetUserProfile } from '../../models/target-user-profile.model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { NavbarComponent } from '../navbar/navbar.component';
import { Course, ShowCourse } from '../../models/course.model';
import { UpdateEnrolledCourse } from '../../models/update-enrolled-course.model';
import { CourseParams } from '../../models/helpers/application-params';
import { CourseService } from '../../services/course.service';
import { PaginatedResult } from '../../models/helpers/paginatedResult';
import { Pagination } from '../../models/helpers/pagination';
import { CurrencyFormatterDirective } from '../../directives/currency-formatter.directive';
import { DatepickerComponent } from '../../datepicker/datepicker.component';
import moment, { Moment } from 'moment-jalaali';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { environment } from '../../../environments/environment.development';
import { Photo } from '../../models/helpers/enrolled-course.model';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-target-user-profile',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, NavbarComponent,
    RouterModule, MatTabsModule, MatNativeDateModule,
    MatRadioModule, MatSnackBarModule, MatDatepickerModule,
    MatSelectModule, CurrencyFormatterDirective, DatepickerComponent,
    MatPaginatorModule, FileUploadModule
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
  private _accounService = inject(AccountService);
  private _snackBar = inject(MatSnackBar);

  apiUrl = environment.apiUrl;
  apiPhotoUrl = environment.apiPhotoUrl;
  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  targetUserProfile: TargetUserProfile | null = null;
  courses: Course[] | null = [];
  shamsiCourses: (Course & { shamsiStart: string })[] = [];
  courseTitles: string[] | null = [];
  member: Member | undefined;
  loggedInUser: LoggedInUser | undefined | null;

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
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  shamsiDisplayDate: string = '';
  targetProfileEditMode = false;

  readonly minAge = 11;
  readonly maxAge = 90;

  min = moment().subtract(this.maxAge, 'jYear').startOf('day');
  max = moment().subtract(this.minAge, 'jYear').endOf('day');

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 99, 0, 1);
    this.maxDate = new Date(currentYear - 15, 0, 1);
    this.loggedInUser = this._accounService.loggedInUserSig();

    this.getTargetUserProfile();
    this.getTargetUserCourse();
    this.getTargetCourseTitles();
    this.courseParams = new CourseParams();
    this.getAll();
    this.initializeUploader();
  }

  targetMemberEditFg: FormGroup = this._fb.group({
    targetNameCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    targetLastNameCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    targetDateOfBirthCtrl: [{ value: '', disabled: true }, [Validators.required]],
    targetPhoneNumCtrl: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    targetGenderCtrl: [{ value: '', disabled: true }, [Validators.required]]
  });

  addEnrolledCourseFg: FormGroup = this.fb.group({
    titleCtrl: ['', Validators.required],
    classNameCtrl: ['', Validators.required],
    numberOfPaymentsCtrl: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
    paidAmountCtrl: ['', [Validators.required, Validators.min(0), Validators.max(100_000_000),]],
  });

  updateEnrolledCourseFg: FormGroup = this.fb.group({
    titleCourseUpdateCtrl: ['', Validators.required],
    paidAmountUpdateCtrl: ['', [Validators.required, Validators.min(10_000), Validators.max(100_000_000),]],
    methodCtrl: ['', [Validators.required]]
  })

  get TargetNameCtrl(): FormControl {
    return this.targetMemberEditFg.get('targetNameCtrl') as FormControl;
  }
  get TargetLastNameCtrl(): FormControl {
    return this.targetMemberEditFg.get('targetLastNameCtrl') as FormControl;
  }
  get TargetDateOfBirthCtrl(): FormControl {
    return this.targetMemberEditFg.get('targetDateOfBirthCtrl') as FormControl;
  }
  get TargetPhoneNumCtrl(): FormControl {
    return this.targetMemberEditFg.get('targetPhoneNumCtrl') as FormControl;
  }
  get TargetGenderCtrl(): FormControl {
    return this.targetMemberEditFg.get('targetGenderCtrl') as FormControl;
  }

  //add enrolled-course
  get TitleCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('titleCtrl') as FormControl;
  }
  get ClassNameCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('classNameCtrl') as FormControl;
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

  //Gender Getter
  get isMale(): boolean {
    return this.targetUserProfile?.gender?.toLowerCase() === 'male';
  }
  get isFemale(): boolean {
    return this.targetUserProfile?.gender?.toLowerCase() === 'female';
  }

  fileOverBase(event: boolean): void {
    this.hasBaseDropZoneOver = event;
  }

  initializeUploader(): void {
    if (isPlatformBrowser(this._platformId) && this.loggedInUser) {
      const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

      this.uploader = new FileUploader({
        url: this.apiUrl + 'manager/add-member-photo/' + memberUserName,
        authToken: 'Bearer ' + this.loggedInUser.token,
        isHTML5: true,
        allowedFileType: ['image'],
        removeAfterUpload: true,
        autoUpload: true,
        maxFileSize: 4_000_000
      })

      this.uploader.onAfterAddingFile = (file) => {
        file.withCredentials = false;
      }

      this.uploader.onSuccessItem = (item, response, status, headers) => {
        if (response) {
          const photo: Photo = JSON.parse(response);
          this.targetUserProfile!.memberPhoto = photo;

          this._snackBar.open('عکس پروفایل با موفقیت اپلود شد', 'Close', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          })
        }
      }

      this.uploader.onErrorItem = (item, response, status, headers) => {
        let message = 'آپلود عکس ناموفق بود. لطفاً دوباره تلاش کنید.';

        try {
          const errorObj = JSON.parse(response);
          if (errorObj && errorObj.message) {
            message = errorObj.message
          }
        } catch { }

        this._snackBar.open(message, 'Close', {
          duration: 7000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    }
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
              hours: course.hours ?? (course.totalMinutes ?? 0) / 60,
              hoursPerClass: course.hoursPerClass ?? (course.classMinutes ?? 0) / 60,
              shamsiStart: moment(course.start).format('jYYYY/jMM/jDD')
            }));
          } else {
            this.shamsiCourses = [];
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

  getProfilePhoto(): string {
    if (this.targetUserProfile?.memberPhoto && this.targetUserProfile.memberPhoto.url_165.trim() !== '') {
      let profilePhoto = this.apiPhotoUrl + this.targetUserProfile.memberPhoto.url_165;
      return profilePhoto;
    }

    if (this.isMale) {
      return 'assets/images/menProfilePhoto.png';
    }

    return 'assets/images/womenProfilePhoto.png';
  }

  initTargetControllersValues(targetUserProfile: TargetUserProfile) {
    this.TargetNameCtrl.setValue(targetUserProfile.name);
    this.TargetLastNameCtrl.setValue(targetUserProfile.lastName);
    this.TargetPhoneNumCtrl.setValue(targetUserProfile.phoneNum?.slice(2) ?? '');

    if (targetUserProfile.dateOfBirth) {
      const dobMoment = moment(targetUserProfile.dateOfBirth, 'YYYY-MM-DD');
      this.TargetDateOfBirthCtrl.setValue(dobMoment);
    }

    this.TargetGenderCtrl.setValue(targetUserProfile.gender?.toLowerCase() ?? '');
  }

  updateTargetMember() {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

    const dob = this.TargetDateOfBirthCtrl.value as Moment;
    if (!dob || !dob.isBetween(this.min, this.max, undefined, '[]')) {
      this.openSnack(
        `تاریخ تولد باید بین ${this.min.format('jYYYY/jMM/jDD')} و ${this.max.format('jYYYY/jMM/jDD')} باشد.`,
        'error'
      );
      this.TargetDateOfBirthCtrl.markAsTouched();
      return;
    }

    if (memberUserName) {
      const managerUpdateMember: ManagerUpdateMemberDto = {
        name: this.TargetNameCtrl.value,
        lastName: this.TargetLastNameCtrl.value,
        dateOfBirth: this.toGregorianDateOnly(dob),
        phoneNum: '98' + this.TargetPhoneNumCtrl.value,
        gender: this.TargetGenderCtrl.value
      };

      this._managerService.updateMember(managerUpdateMember, memberUserName)
        .pipe(take(1)).subscribe({
          next: data => {
            this._matSnackBar.open("آپدیت با موفقیت ثبت شد", "Close", {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 10000
            });
            this.targetUserProfile = data;

            this.targetProfileEditMode = false;
            this.targetMemberEditFg.disable();
            this.initTargetControllersValues(this.targetUserProfile);
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
        title: this.TitleCtrl.value,
        className: this.ClassNameCtrl.value,
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

    const dobMoment = moment(event.gregorian, 'YYYY-MM-DD');
    this.TargetDateOfBirthCtrl.setValue(dobMoment);

    this.closeDatePicker();
  }

  getCourseStatus(course: { isStarted: boolean }): string {
    if (course.isStarted) {
      return 'در حال برگزاری';
    }

    return 'شروع نشده';
  }

  // Baraye inke bargarde be hamon details ke dasht 
  onCancelEdit(): void {
    if (this.targetUserProfile) {
      this.initTargetControllersValues(this.targetUserProfile);
      this.targetMemberEditFg.markAsPristine();
      this.targetMemberEditFg.markAsUntouched();
    } else {
      this.targetMemberEditFg.reset();
    }
  }

  // Baraye inke kolan input ha khali beshan
  // onCancelEdit(): void {
  //   this.targetMemberEditFg.reset();
  // }

  onCancelAddEnrolledCourse(): void {
    this.addEnrolledCourseFg.reset();

    this.addEnrolledCourseFg.markAsPristine();
    this.addEnrolledCourseFg.markAsUntouched();
  }

  onCancelUpdateEnrolledCourse(): void {
    this.updateEnrolledCourseFg.reset();
    this.updateEnrolledCourseFg.markAsPristine();
    this.updateEnrolledCourseFg.markAsUntouched();
  }

  enableTargetProfileEdit(): void {
    this.targetProfileEditMode = true;
    this.targetMemberEditFg.enable();
  }

  cancelTargetProfileEdit(): void {
    this.targetProfileEditMode = false;
    this.targetMemberEditFg.disable();

    if (this.targetUserProfile) {
      this.initTargetControllersValues(this.targetUserProfile);
    }
  }

  private toGregorianDateOnly(value: Moment | Date | string | null | undefined): string | undefined {
    if (!value) return undefined;

    if (moment.isMoment(value)) {
      return value.locale('en').format('YYYY-MM-DD');
    }

    if (typeof value === 'string') {
      const m = moment(value);
      if (m.isValid()) {
        return m.locale('en').format('YYYY-MM-DD');
      }
      const d = new Date(value);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
    }

    const d = value as Date;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this._matSnackBar.open(
      message,
      'باشه',
      {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'],
        direction: 'rtl'
      }
    );
  }
}