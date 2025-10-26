import { Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { UserProfile } from '../../../models/user-profile.model';
import { MemberService } from '../../../services/member.service';

@Component({
  selector: 'app-right-sidebar',
  imports: [RouterModule],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private accountService = inject(AccountService);

  public memberService = inject(MemberService);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  profile: UserProfile | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;
  }

  logout(): void {
    this.accountService.logout();
    // this.closeProfile();
  }
}