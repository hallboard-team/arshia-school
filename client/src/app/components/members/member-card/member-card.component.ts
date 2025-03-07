import { Component, Input, OnDestroy, OnInit, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Member } from '../../../models/member.model';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment.development';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { MatButtonModule } from '@angular/material/button';
import moment from 'moment';
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

  // isExpanded: boolean = false;
  // message: string = '';

  // selectedDate: string = new Date().toISOString().split("T")[0];
  // attendenceStatus: { [userName: string]: boolean } = {}; 

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    // const persianDate = new Date();
    // this.selectedDate = moment(persianDate).format('jYYYY/jMM/jDD');
  }

  // addDiscription(targetUserName: string, adminInput: AddDiscription): Observable<ApiResponse | null> {
  //   return this._http.post<ApiResponse>(this._apiUrl + 'add-discription/' + targetUserName, adminInput).pipe(
  //     map(apiResponse => {
  //       if (apiResponse) {
  //         this.snackBar.open("add-teacher Done", "Close", { horizontalPosition: "center", verticalPosition: "bottom", duration: 7000 })

  //         return apiResponse;
  //       }

  //       return null;
  //     })
  //   );
  // }
}