import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable, Subscription } from 'rxjs';
import { Course } from '../../../models/course.model';
import { CourseParams } from '../../../models/helpers/course-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { CourseService } from '../../../services/course.service';
import { MemberService } from '../../../services/member.service';
import { Attendence } from '../../../models/attendence.model';
import { AttendenceParams } from '../../../models/helpers/attendence-params';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { StudentCardComponent } from '../../students/student-card/student-card.component';
import { AttendenceCardComponent } from "../attendence-card/attendence-card.component";

@Component({
  selector: 'app-attendence-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule, NavbarComponent, AttendenceCardComponent
],
  templateUrl: './attendence-list.component.html',
  styleUrl: './attendence-list.component.scss'
})
export class AttendenceListComponent implements OnInit, OnDestroy{
  memberService = inject(MemberService);
  attendences$: Observable<Attendence[] | null> | undefined;
  
  subscribed: Subscription | undefined;
   
  pagination: Pagination | undefined;
  attendences: Attendence[] | undefined;
  attendenceParams: AttendenceParams | undefined;
  
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;

  private _route = inject(ActivatedRoute);
  
  ngOnInit(): void {
    this.attendenceParams = new CourseParams();
  
    this.getAllAttendence();
  }
  
  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }
  
  getAllAttendence(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      if (this.attendenceParams) {
        this.subscribed = this.memberService.getAllAttendence(this.attendenceParams, courseTitle).subscribe({
          next: (response: PaginatedResult<Attendence[]>) => {
            if (response.body && response.pagination) {
              this.attendences = response.body;
              this.pagination = response.pagination;
            }
          }
        });
      }
    }
  }
  
  handlePageEvent(e: PageEvent) {
    if (this.attendenceParams) {
      if (e.pageSize !== this.attendenceParams.pageSize)
        e.pageIndex = 0;
  
      this.pageEvent = e;
      this.attendenceParams.pageSize = e.pageSize;
      this.attendenceParams.pageNumber = e.pageIndex + 1;
  
      this.getAllAttendence();
    }
  }
}
