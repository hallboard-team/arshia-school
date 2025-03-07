import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule, MemberCardComponent, MatPaginatorModule,
    NavbarComponent
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  private _memberService = inject(MemberService);
    
  members: Member[] | undefined;
  students$: Observable<Member[] | null> | undefined;
  pagination: Pagination | undefined;
    
  memberParams: MemberParams | undefined;
  subscribed: Subscription | undefined;
  
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;
    
  private _route = inject(ActivatedRoute);
    
  ngOnInit(): void {
    this.memberParams = new MemberParams();
  
    this.getAllMembers();
  }
  
  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }
  
  getAllMembers(): void {
    if (this.memberParams)
      this.subscribed = this._memberService.getAllMembers(this.memberParams).subscribe({
        next: (response: PaginatedResult<Member[]>) => {
          if (response.body && response.pagination) {
            this.members = response.body;
            this.pagination = response.pagination;
  
            this.members.forEach(member => {
              member.isAbsent = member.isAbsent ?? false;
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
  
      this.getAllMembers();
    }
  }
}