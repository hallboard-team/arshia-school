import { CommonModule } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { SelectCourseCardComponent } from "../select-course-card/select-course-card.component";
import { Observable, Subscription } from 'rxjs';
import { Course, ShowCourse } from '../../../models/course.model';
import { CourseParams } from '../../../models/helpers/course-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { CourseService } from '../../../services/course.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddEnrolledCourse } from '../../../models/add-enrolled-course.model';
import { ManagerService } from '../../../services/manager.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { UpdateEnrolledCourse } from '../../../models/update-enrolled-course.model';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-enrolled-course',
  standalone: true,
  imports: [
    CommonModule, MatPaginatorModule, ReactiveFormsModule,
    NavbarComponent, RouterModule, MatFormFieldModule,
    SelectCourseCardComponent, MatSnackBarModule,
    MatInputModule, MatButtonModule, MatTabsModule,
    MatRadioModule, MatSelectModule
  ],
  templateUrl: './enrolled-course.component.html',
  styleUrl: './enrolled-course.component.scss'
})
export class EnrolledCourseComponent {
  private _accountService = inject(AccountService);
  private _courseService = inject(CourseService);
  private _managerService = inject(ManagerService);
  private _route = inject(ActivatedRoute);
  private _matSnackBar = inject(MatSnackBar);
  fb = inject(FormBuilder);

  courses$: Observable<Course[] | null> | undefined;

  subscribed: Subscription | undefined;
  pagination: Pagination | undefined;
  showCourses: ShowCourse[] | undefined;
  courseParams: CourseParams | undefined;
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;
  memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');

  ngOnInit(): void {
    this.courseParams = new CourseParams();
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

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

  get TitleCourseCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('titleCourseCtrl') as FormControl;
  }
  get NumberOfPaymentsCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('numberOfPaymentsCtrl') as FormControl;
  }
  get PaidAmountCtrl(): FormControl {
    return this.addEnrolledCourseFg.get('paidAmountCtrl') as FormControl;
  }

  get TitleCourseUpdateCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('titleCourseUpdateCtrl') as FormControl;
  }
  get PaidAmountUpdateCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('paidAmountUpdateCtrl') as FormControl;
  }
  get MethodCtrl(): FormControl {
    return this.updateEnrolledCourseFg.get('methodCtrl') as FormControl;
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
          this._matSnackBar.open("اضافه کردن دوره با موفقیت انجام شد", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
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
}