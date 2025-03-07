import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MemberParams } from '../../../models/helpers/member-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { Member } from '../../../models/member.model';
import { TeacherService } from '../../../services/teacher.service';
import { MemberCardComponent } from '../../members/member-card/member-card.component';
import { StudentCardComponent } from '../student-card/student-card.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    StudentCardComponent, MatPaginatorModule, NavbarComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent {
  private _teacherService = inject(TeacherService);
  
  students: Member[] | undefined;
  students$: Observable<Member[] | null> | undefined;
  pagination: Pagination | undefined;
  
  memberParams: MemberParams | undefined;
  subscribed: Subscription | undefined;

  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;
  
  private _route = inject(ActivatedRoute);
  
  courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');
  
  ngOnInit(): void {
    this.courseTitle = this.courseTitle;

    this.memberParams = new MemberParams();

    this.getStudents();

    console.log(this.students);
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

  getStudents(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (this.memberParams && courseTitle)
      this.subscribed = this._teacherService.getStudents(this.memberParams, courseTitle).subscribe({
        next: (response: PaginatedResult<Member[]>) => {
          if (response.body && response.pagination) {
            this.students = response.body;
            this.pagination = response.pagination;

            this.students.forEach(student => {
              student.isAbsent = student.isAbsent ?? false;
            });
          }
        }
      });
  }

  handlePageEvent(e: PageEvent) {
    if (this.memberParams) {
      if (e.pageSize !== this.memberParams.pageSize)
        e.pageIndex = 0;

      this.pageEvent = e;
      this.memberParams.pageSize = e.pageSize;
      this.memberParams.pageNumber = e.pageIndex + 1;

      this.getStudents();
    }
  }
}
