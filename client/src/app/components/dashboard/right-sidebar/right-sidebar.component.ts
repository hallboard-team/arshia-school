import { Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { LoggedInUser } from '../../../models/logged-in-user.model';

@Component({
  selector: 'app-right-sidebar',
  imports: [RouterModule],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private accountService = inject(AccountService);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;
  }
}