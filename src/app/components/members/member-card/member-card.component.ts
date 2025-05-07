import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Member } from '../../../models/member.model';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment.development';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { MatButtonModule } from '@angular/material/button';

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

  private _snack = inject(MatSnackBar);


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