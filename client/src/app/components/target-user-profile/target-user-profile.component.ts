import { Component, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms'; // FormControl رو برای تب های دیگه نگه دار
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import moment from 'moment-jalaali';

import { ManagerService } from '../../services/manager.service';
import { CourseService } from '../../services/course.service';
import { AccountService } from '../../services/account.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProfileInfoCardComponent } from '../shared/profile-info-card/profile-info-card.component';
import { ProfileEditFormComponent } from '../shared/profile-edit-form/profile-edit-form.component';
import { CurrencyFormatterDirective } from '../../directives/currency-formatter.directive';

import { Course, ShowCourse } from '../../models/course.model';
import { AddEnrolledCourse } from '../../models/add-enrolled-course.model';
import { UpdateEnrolledCourse } from '../../models/update-enrolled-course.model';
import { ManagerUpdateMemberDto } from '../../models/manager-update-member.model';
import { Pagination } from '../../models/helpers/pagination';
import { environment } from '../../../environments/environment.development';
import { CourseParams } from '../../models/helpers/application-params';

@Component({
  selector: 'app-target-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatTabsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatRadioModule, MatPaginatorModule, MatSnackBarModule,
    FileUploadModule,
    NavbarComponent, CurrencyFormatterDirective,
    ProfileInfoCardComponent, ProfileEditFormComponent
  ],
  templateUrl: './target-user-profile.component.html',
  styleUrl: './target-user-profile.component.scss'
})
export class TargetUserProfileComponent implements OnInit {
  private _managerService = inject(ManagerService);
  private _courseService = inject(CourseService);
  private _route = inject(ActivatedRoute);
  private _fb = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);
  private _platformId = inject(PLATFORM_ID);
  private _accountService = inject(AccountService);

  apiUrl = environment.apiUrl;
  apiPhotoUrl = environment.apiPhotoUrl;

  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;

  targetUserProfile: any = null; 
  courses: Course[] | null = [];
  shamsiCourses: any[] = [];
  courseTitles: string[] | null = [];
  showCourses: ShowCourse[] | undefined;

  loading = true;
  error: string | null = null;
  isSavingProfile = false;

  // Pagination & Filters
  courseParams = new CourseParams();
  pagination: Pagination | undefined;
  pageSizeOptions = [5, 10, 25];

  // Forms for OTHER tabs
  addEnrolledCourseFg: FormGroup = this._fb.group({
    titleCtrl: ['', Validators.required],
    classNameCtrl: ['', Validators.required],
    numberOfPaymentsCtrl: ['', [Validators.required, Validators.min(0), Validators.max(99)]],
    paidAmountCtrl: ['', [Validators.required, Validators.min(0), Validators.max(100_000_000)]],
  });

  updateEnrolledCourseFg: FormGroup = this._fb.group({
    titleCourseUpdateCtrl: ['', Validators.required],
    paidAmountUpdateCtrl: ['', [Validators.required, Validators.min(10_000), Validators.max(100_000_000)]],
    methodCtrl: ['', [Validators.required]]
  });

  // Getters for other forms
  get TitleCtrl(): FormControl { return this.addEnrolledCourseFg.get('titleCtrl') as FormControl; }
  get ClassNameCtrl(): FormControl { return this.addEnrolledCourseFg.get('classNameCtrl') as FormControl; }
  get NumberOfPaymentsCtrl(): FormControl { return this.addEnrolledCourseFg.get('numberOfPaymentsCtrl') as FormControl; }
  get PaidAmountCtrl(): FormControl { return this.addEnrolledCourseFg.get('paidAmountCtrl') as FormControl; }

  get TitleCourseUpdateCtrl(): FormControl { return this.updateEnrolledCourseFg.get('titleCourseUpdateCtrl') as FormControl; }
  get PaidAmountUpdateCtrl(): FormControl { return this.updateEnrolledCourseFg.get('paidAmountUpdateCtrl') as FormControl; }
  get MethodCtrl(): FormControl { return this.updateEnrolledCourseFg.get('methodCtrl') as FormControl; }

  ngOnInit(): void {
    this.getTargetUserProfile();
    this.getTargetUserCourse();
    this.getTargetCourseTitles();
    this.getAllCourses();
    this.initializeUploader();
  }

  // --- Profile Logic ---

  getTargetUserProfile(): void {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (!userName) return;

    this._managerService.getMemberByUserName(userName).subscribe({
      next: (data) => {
        this.targetUserProfile = {
          ...data,
          photoUrl: data.memberPhoto?.url_165
            ? (data.memberPhoto.url_165.startsWith('http') ? data.memberPhoto.url_165 : this.apiPhotoUrl + data.memberPhoto.url_165)
            : null
        };
        this.loading = false;
      },
      error: () => {
        this.error = 'خطا در دریافت پروفایل';
        this.loading = false;
      }
    });
  }

  onProfileUpdate(updatedData: any) {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (!userName) return;

    this.isSavingProfile = true;

    const updateDto: ManagerUpdateMemberDto = {
      name: updatedData.name,
      lastName: updatedData.lastName,
      dateOfBirth: updatedData.dateOfBirth, 
      phoneNum: updatedData.phoneNum,
      gender: updatedData.gender
    };

    this._managerService.updateMember(updateDto, userName).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        this._snackBar.open('پروفایل با موفقیت بروز شد', 'باشه', { duration: 4000, panelClass: 'snack-success' });
        this.targetUserProfile = { ...this.targetUserProfile, ...updateDto };
      },
      error: (err) => {
        this.isSavingProfile = false;
        this._snackBar.open('خطا در ویرایش پروفایل', 'باشه', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }

  // --- Photo Upload Logic ---

  initializeUploader(): void {
    if (isPlatformBrowser(this._platformId)) {
      const token = this._accountService.loggedInUserSig()?.token;
      const userName = this._route.snapshot.paramMap.get('memberUserName');

      if (token && userName) {
        this.uploader = new FileUploader({
          url: this.apiUrl + 'manager/add-member-photo/' + userName,
          authToken: 'Bearer ' + token,
          isHTML5: true,
          allowedFileType: ['image'],
          removeAfterUpload: true,
          autoUpload: true,
          maxFileSize: 4_000_000
        });

        this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

        this.uploader.onSuccessItem = (item, response, status, headers) => {
          if (response) {
            const photo = JSON.parse(response);
            if (this.targetUserProfile) {
              this.targetUserProfile.photoUrl = this.apiPhotoUrl + photo.url_165;
              this.targetUserProfile = { ...this.targetUserProfile };
            }
            this._snackBar.open('عکس آپلود شد', 'باشه');
          }
        };
      }
    }
  }

  fileOverBase(e: any) { this.hasBaseDropZoneOver = e; }
  triggerFileUpload() {

  }


  // --- Courses Logic (Existing code kept simple) ---

  getTargetUserCourse() {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (userName) {
      this._managerService.getTargetUserCourses(userName).subscribe(data => {
        this.courses = data;
        this.shamsiCourses = data?.map(c => ({
          ...c,
          shamsiStart: moment(c.start).format('jYYYY/jMM/jDD')
        })) || [];
      });
    }
  }

  getTargetCourseTitles() {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (userName) {
      this._managerService.getTargetCourseTitles(userName).subscribe(data => this.courseTitles = data);
    }
  }

  getAllCourses() {
    this._courseService.getAll(this.courseParams).subscribe(res => {
      if (res.body) {
        this.showCourses = res.body;
        this.pagination = res.pagination;
      }
    });
  }

  getCourseStatus(course: any): string {
    return course.isStarted ? 'در حال برگزاری' : 'شروع نشده';
  }

  handlePageEvent(e: PageEvent) {
    this.courseParams.pageNumber = e.pageIndex + 1;
    this.courseParams.pageSize = e.pageSize;
    this.getAllCourses();
  }

  // --- Enrolled Course Actions ---

  addEnrolledCourse() {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (userName && this.addEnrolledCourseFg.valid) {
      const dto: AddEnrolledCourse = {
        title: this.TitleCtrl.value,
        className: this.ClassNameCtrl.value,
        numberOfPayments: this.NumberOfPaymentsCtrl.value,
        paidAmount: this.PaidAmountCtrl.value
      };
      this._managerService.addEnrolledCourse(userName, dto).subscribe({
        next: () => {
          this._snackBar.open('دوره اضافه شد', 'باشه');
          this.getTargetUserCourse(); 
          this.addEnrolledCourseFg.reset();
        },
        error: () => this._snackBar.open('خطا در افزودن دوره', 'باشه')
      });
    }
  }

  updateEnrolledCourse() {
    const userName = this._route.snapshot.paramMap.get('memberUserName');
    if (userName && this.updateEnrolledCourseFg.valid) {
      const dto: UpdateEnrolledCourse = {
        titleCourse: this.TitleCourseUpdateCtrl.value,
        paidAmount: this.PaidAmountUpdateCtrl.value,
        method: this.MethodCtrl.value
      };
      this._managerService.updateEnrolledCourse(userName, dto).subscribe({
        next: () => {
          this._snackBar.open('شهریه ثبت شد', 'باشه');
          this.updateEnrolledCourseFg.reset();
        },
        error: () => this._snackBar.open('خطا در ثبت شهریه', 'باشه')
      });
    }
  }

  onCancelAddEnrolledCourse() { this.addEnrolledCourseFg.reset(); }
  onCancelUpdateEnrolledCourse() { this.updateEnrolledCourseFg.reset(); }
}