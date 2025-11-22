import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Member } from '../../../models/member.model';
import { MemberService } from '../../../services/member.service';
import { MemberCardComponent } from '../member-card/member-card.component';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Pagination } from '../../../models/helpers/pagination';
import { MemberParams } from '../../../models/helpers/member-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { AbstractControl, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-member-list',
  imports: [
    CommonModule, MemberCardComponent, MatPaginatorModule,
    NavbarComponent, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSliderModule,
    FormsModule, ReactiveFormsModule, MatIcon
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  private _memberService = inject(MemberService);
  private _route = inject(ActivatedRoute);
  private _fB = inject(FormBuilder);

  members: Member[] = [];
  students$: Observable<Member[] | null> | undefined;
  pagination: Pagination | undefined;

  memberParams: MemberParams | undefined;
  subscribed: Subscription | undefined;

  pageSizeOptions = [9, 18, 25];
  pageEvent: PageEvent | undefined;

  readonly minAge: number = 11;
  readonly maxAge: number = 99;

  filterFg = this._fB.group({
    searchCtrl: ['', []],
    courseCtrl: ['', []],
    classCtrl: ['', []],
    minAgeCtrl: [this.minAge, []],
    maxAgeCtrl: [this.maxAge, []]
  });

  get SearchCtrl(): FormControl {
    return this.filterFg.get('searchCtrl') as FormControl;
  }

  get CourseCtrl(): FormControl {
    return this.filterFg.get('courseCtrl') as FormControl;
  }

  get ClassCtrl(): FormControl {
    return this.filterFg.get('classCtrl') as FormControl;
  }

  get MinAgeCtrl(): AbstractControl {
    return this.filterFg.get('minAgeCtrl') as FormControl;
  }

  get MaxAgeCtrl(): AbstractControl {
    return this.filterFg.get('maxAgeCtrl') as FormControl;
  }

  ngOnInit(): void {
    this.memberParams = new MemberParams();

    const width = window.innerWidth;

    if (width < 600) {
      this.memberParams.pageSize = 9;
    } else if (width < 1024) {
      this.memberParams.pageSize = 18;
    } else {
      this.memberParams.pageSize = 25;
    }

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

  getAll(): void {
    if (this.memberParams)
      this.subscribed = this._memberService.getAllMembers(this.memberParams).subscribe({
        next: (response: PaginatedResult<Member[]>) => {
          if (response.body && response.pagination) {
            this.members = response.body;
            this.pagination = response.pagination;
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

      this.getAll();
    }
  }

  updateMemberParams(): void {
    if (this.memberParams) {
      this.memberParams.search = this.SearchCtrl.value;
      this.memberParams.minAge = this.MinAgeCtrl.value;
      this.memberParams.maxAge = this.MaxAgeCtrl.value;
      this.memberParams.courseTitle = this.CourseCtrl.value;
      this.memberParams.classTitle = this.ClassCtrl.value;
    }
  }

  reset(): void {
    this.SearchCtrl.reset();
    this.CourseCtrl.reset();
    this.ClassCtrl.reset();
    this.MinAgeCtrl.setValue(this.minAge);
    this.MaxAgeCtrl.setValue(this.maxAge);
  }
}