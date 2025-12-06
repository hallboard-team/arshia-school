import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavbarComponent } from "../../navbar/navbar.component";
import { MemberService } from '../../../services/member.service';
import { MatDialog } from '@angular/material/dialog';
import { Member } from '../../../models/member.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MemberParams } from '../../../models/helpers/member-params';
import { isPlatformBrowser } from '@angular/common';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { Pagination } from '../../../models/helpers/pagination';
import { MatIconModule } from '@angular/material/icon';
import { MemberCardComponent } from "../member-card/member-card.component";
import { StaffCardComponent } from "../staff-card/staff-card.component";
import { StaffFilterDialogComponent } from '../staff-filter-dialog/staff-filter-dialog.component';

@Component({
  selector: 'app-staff-list',
  imports: [NavbarComponent, MatIconModule, StaffCardComponent, MatPaginatorModule],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.scss'
})
export class StaffListComponent implements OnInit {
  private _memberService = inject(MemberService);
  private _platformId = inject(PLATFORM_ID);

  readonly dialog = inject(MatDialog);

  members: Member[] = [];
  pageSizeOptions = [9, 18, 25];
  pageEvent: PageEvent | undefined;
  memberParams: MemberParams | undefined;
  isFiltered: boolean = false;
  pagination: Pagination | undefined;

  ngOnInit(): void {
    this.memberParams = new MemberParams();

    this.memberParams.roles = ['secretary', 'teacher'];


    if (isPlatformBrowser(this._platformId)) {
      const width = window.innerWidth;

      if (width < 600) {
        this.memberParams.pageSize = 9;
      } else if (width < 1024) {
        this.memberParams.pageSize = 18;
      } else {
        this.memberParams.pageSize = 25;
      }
    }

    this.getAll();
  }

  openDialog(): void {
    if (isPlatformBrowser(this._platformId)) {
      const isMobile = window.innerWidth <= 768;

      const dialogRef = this.dialog.open(StaffFilterDialogComponent, {
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
    if (this.memberParams) {
      this._memberService.getAllMembers(this.memberParams).subscribe({
        next: (response) => {
          if (!response || !response.body || response.body.length === 0) {
            this.members = [];
            this.pagination = undefined;
            return;
          }

          if (response.body && response.pagination) {
            this.members = response.body;
            this.pagination = response.pagination;
          }
        }
      })
    }
  }

  clearFilters(): void {
    if (!this.memberParams) return;

    this.memberParams.search = '';
    this.memberParams.courseTitle = '';
    this.memberParams.className = '';
    this.memberParams.roles = ['secretary', 'teacher'];
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
