import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable, Subscription } from 'rxjs';

import { RouterModule } from '@angular/router';
import { Course, ShowCourse } from '../../../../models/course.model';
import { CourseParams } from '../../../../models/helpers/course-params';
import { PaginatedResult } from '../../../../models/helpers/paginatedResult';
import { Pagination } from '../../../../models/helpers/pagination';
import { LoggedInUser } from '../../../../models/logged-in-user.model';
import { AccountService } from '../../../../services/account.service';
import { CourseService } from '../../../../services/course.service';
import { NavbarComponent } from '../../../navbar/navbar.component';
import { CourseCardComponent } from '../../course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  imports: [
    CommonModule, MatPaginatorModule, CourseCardComponent,
    NavbarComponent, RouterModule
  ],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.scss'
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private _accountService = inject(AccountService);
  courseService = inject(CourseService);
  courses$: Observable<Course[] | null> | undefined;

  subscribed: Subscription | undefined;
  pagination: Pagination | undefined;
  showCourses: ShowCourse[] | undefined;
  courseParams: CourseParams | undefined;
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.courseParams = new CourseParams();
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

  getAll(): void {
    if (this.courseParams)
      this.subscribed = this.courseService.getAll(this.courseParams).subscribe({
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