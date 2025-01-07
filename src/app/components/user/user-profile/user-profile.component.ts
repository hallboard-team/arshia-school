import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MemberService } from '../../../services/member.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, take } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Member } from '../../../models/member.model';
import { UserProfile } from '../../../models/user-profile.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { jwtInterceptor } from '../../../interceptors/jwt.interceptor';
import { HashedUserId } from '../../../models/helpers/hashed-user-id.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit{
  private memberService = inject(MemberService);
  private fb = inject(FormBuilder);
  private matSnak = inject(MatSnackBar);
  private platfromId = inject(PLATFORM_ID);

  subscribedMember: Subscription | undefined;
  user: UserProfile | undefined;
  hashedUserId: HashedUserId | undefined;

  ngOnInit(): void {
    this.hashedUserId;

    this.getUser();
  }

  getUser(): void {
    if (this.hashedUserId) {
      this.subscribedMember = this.memberService.getProfile(this.hashedUserId).pipe(take(1))
      .subscribe(user => {
        next: (user: UserProfile) => {
            this.user;
        }
      });
      // const loggedInUserStr: string | null = localStorage.getItem('loggedInUser');

      // if (loggedInUserStr) {
      //   const loggedInUser: LoggedInUser = JSON.parse(loggedInUserStr);

      //   this.memberService.getProfile(loggedInUser)?.pipe(take(1)).subscribe(user => {
      //     if (user?.userName) {
      //       this.user;
      //     }
      //   });
      // }
    }
  }
}