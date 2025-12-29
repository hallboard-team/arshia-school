import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ShowCourse } from '../../../models/course.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { ShowSite } from '../../../models/site.model';

@Component({
  selector: 'app-site-card',
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatCardModule, MatIconModule
  ],
  templateUrl: './site-card.component.html',
  styleUrl: './site-card.component.scss'
})
export class SiteCardComponent {
  @Input('siteInput') siteIn: ShowSite | undefined;

  private _accountService = inject(AccountService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}