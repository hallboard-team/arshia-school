import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable, Subscription } from 'rxjs';

import { RouterModule } from '@angular/router';
import { Course, ShowCourse } from '../../../models/course.model';
import { CourseParams } from '../../../models/helpers/course-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { CourseService } from '../../../services/course.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CourseCardComponent } from '../course-card/course-card.component';
import { BackForwardButtonComponent } from "../../back-forward-button/back-forward-button.component";

@Component({
  selector: 'app-course-list',
  imports: [
    CommonModule, MatPaginatorModule, CourseCardComponent,
    NavbarComponent, RouterModule,
    BackForwardButtonComponent
  ],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CoursesListComponent implements OnInit, OnDestroy {
  private _accountService = inject(AccountService);
  courseService = inject(CourseService);
  courses$: Observable<Course[] | null> | undefined;

  isSticky: boolean = false;

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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollOffset > 280) {
      this.isSticky = true;
    } else {
      this.isSticky = false;
    }
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