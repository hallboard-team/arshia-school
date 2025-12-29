import { Component, HostListener, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

import { ClassParams } from '../../../models/helpers/application-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { ShowClass } from '../../../models/class.model'; 

import { AccountService } from '../../../services/account.service';
import { ClassService } from '../../../services/class.service';

import { NavbarComponent } from "../../navbar/navbar.component";
import { BackForwardButtonComponent } from "../../back-forward-button/back-forward-button.component";
import { ClassCardComponent } from '../class-card/class-card.component';

@Component({
  selector: 'app-class-list',
  standalone: true, 
  imports: [
    NavbarComponent, BackForwardButtonComponent, 
    RouterModule, ClassCardComponent, MatPaginatorModule 
  ],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit, OnDestroy {
  private _accountService = inject(AccountService);
  private _classService = inject(ClassService); 

  isSticky: boolean = false;
  subscribed: Subscription | undefined;
  
  pagination: Pagination | undefined;
  showClasses: ShowClass[] | undefined;
  classParams: ClassParams | undefined;
  
  pageSizeOptions = [5, 10, 25];
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.classParams = new ClassParams();
    this.loggedInUserSig = this._accountService.loggedInUserSig;
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollOffset = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isSticky = scrollOffset > 280;
  }

  getAll(): void {
    if (this.classParams) {
      this.subscribed = this._classService.getAll(this.classParams).subscribe({
        next: (response: PaginatedResult<ShowClass[]>) => {
          if (response.body && response.pagination) {
            this.showClasses = response.body;
            this.pagination = response.pagination;
          }
        }
      });
    }
  }

  handlePageEvent(e: PageEvent): void {
    if (this.classParams) {
      if (e.pageSize !== this.classParams.pageSize) {
        e.pageIndex = 0;
        this.classParams.pageNumber = 1;
      } else {
        this.classParams.pageNumber = e.pageIndex + 1;
      }
      
      this.classParams.pageSize = e.pageSize;
      this.getAll();
    }
  }
}