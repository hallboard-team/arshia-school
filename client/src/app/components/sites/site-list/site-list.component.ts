import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { BackForwardButtonComponent } from '../../back-forward-button/back-forward-button.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Subscription } from 'rxjs';
import { SiteParams } from '../../../models/helpers/application-params';
import { PaginatedResult } from '../../../models/helpers/paginatedResult';
import { Pagination } from '../../../models/helpers/pagination';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { SiteCardComponent } from "../site-card/site-card.component";
import { ShowSite } from '../../../models/site.model';
import { SiteService } from '../../../services/site.service';

@Component({
  selector: 'app-site-list',
  standalone: true, 
  imports: [
    CommonModule, MatPaginatorModule,
    NavbarComponent, RouterModule,
    BackForwardButtonComponent,
    SiteCardComponent
  ],
  templateUrl: './site-list.component.html',
  styleUrl: './site-list.component.scss'
})
export class SiteListComponent implements OnInit, OnDestroy {
  private _accountService = inject(AccountService);
  private siteService = inject(SiteService); 

  isSticky: boolean = false;
  subscribed: Subscription | undefined;
  
  pagination: Pagination | undefined;
  showSites: ShowSite[] = []; 
  siteParams: SiteParams | undefined;
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.siteParams = new SiteParams();
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
    if (this.siteParams) {
      this.subscribed = this.siteService.getAll(this.siteParams).subscribe({
        next: (response: PaginatedResult<ShowSite[]>) => {
          if (response.body && response.pagination) {
            this.showSites = response.body;
            this.pagination = response.pagination;
          }
        },
        error: (err) => {
          console.error('Error fetching sites:', err);
        }
      });
    }
  }

  handlePageEvent(e: PageEvent): void {
    if (this.siteParams) {
      if (e.pageSize !== this.siteParams.pageSize) {
         this.siteParams.pageNumber = 1; 
      } else {
         this.siteParams.pageNumber = e.pageIndex + 1;
      }

      this.pageEvent = e;
      this.siteParams.pageSize = e.pageSize;

      this.getAll();
    }
  }
}