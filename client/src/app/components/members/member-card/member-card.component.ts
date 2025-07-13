import { Component, Input, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Member } from '../../../models/member.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../../services/account.service';
import { MemberService } from '../../../services/member.service';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule,
    MatCardModule, MatIconModule
  ],
  templateUrl: './member-card.component.html',
  styleUrl: './member-card.component.scss'
})
export class MemberCardComponent {
  @Input('memberInput') memberIn: Member | undefined;
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  private _memberService = inject(MemberService);
  private _snack = inject(MatSnackBar);
  private _accountService = inject(AccountService);
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}