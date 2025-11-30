import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-member-list',
  imports: [
    CommonModule, MemberCardComponent, MatPaginatorModule,
    NavbarComponent, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatSliderModule,
    FormsModule, ReactiveFormsModule, MatIconModule
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  private _memberService = inject(MemberService);
  private _route = inject(ActivatedRoute);
  private _fB = inject(FormBuilder);
  private _platformId = inject(PLATFORM_ID);

  readonly dialog = inject(MatDialog);

  members: Member[] = [];
  students$: Observable<Member[] | null> | undefined;
  pagination: Pagination | undefined;
  isFiltered: boolean = false;

  memberParams: MemberParams | undefined;
  subscribed: Subscription | undefined;

  pageSizeOptions = [9, 18, 25];
  pageEvent: PageEvent | undefined;

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

  openDialog(): void {
    if (isPlatformBrowser(this._platformId)) {
      const isMobile = window.innerWidth <= 768;

      const dialogRef = this.dialog.open(FilterDialogComponent, {
        width: isMobile ? '100vw' : '600px',
        maxWidth: '100vw',
        position: isMobile ? { bottom: '0', left: '0' } : undefined,
        panelClass: isMobile ? 'mobile-filter-dialog' : undefined,
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.memberParams = result;
          this.isFiltered = true;
          this.getAll();
        }
      })
    }
  }

  getAll(): void {
    if (this.memberParams)
      this.subscribed = this._memberService.getAllMembers(this.memberParams).subscribe({
        next: (response: PaginatedResult<Member[]>) => {
          if (!response || !response.body || response.body.length === 0) {
            this.members = [];
            this.pagination = undefined;
            return;
          }

          if (response.body && response.pagination) {
            this.members = response.body;
            this.pagination = response.pagination;
          }
        },
      });
  }

  clearFilters(): void {
    if (!this.memberParams) return;

    this.memberParams.search = '';
    this.memberParams.courseTitle = '';
    this.memberParams.className = '';
    this.memberParams.minAge = 11;
    this.memberParams.maxAge = 99;
    this.memberParams.pageNumber = 1;
    this.memberParams.pageSize = 5;

    this.isFiltered = false;
    this.getAll();
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
}