import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { Member } from '../../../models/member.model';
import { AccountService } from '../../../services/account.service';
import { environment } from '../../../../environments/environment.development';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-staff-card',
  imports: [
    RouterLink, RouterModule
  ],
  templateUrl: './staff-card.component.html',
  styleUrl: './staff-card.component.scss'
})
export class StaffCardComponent implements OnInit {
  @Input('memberInput') memberIn: Member | undefined;
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  photoUrl = environment.apiPhotoUrl;

  private _accountService = inject(AccountService);

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}
