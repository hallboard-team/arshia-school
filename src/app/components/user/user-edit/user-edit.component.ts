import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Subscription, take } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { Member } from '../../../models/member.model';
import { MemberService } from '../../../services/member.service';
import { MemberUpdate } from '../../../models/member-update.model';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
  private memberService = inject(MemberService);
  private fb = inject(FormBuilder);
  private matSnak = inject(MatSnackBar);
  private platfromId = inject(PLATFORM_ID);

  subscribedMember: Subscription | undefined;
  member: Member | undefined;

  // readonly maxTextAreaChars: number = 1000;
  // readonly minInputChars: number = 2;
  // readonly maxInputChars: number = 30;

  ngOnInit(): void {
    this.getMember();
  }

  getMember(): void {
    if (isPlatformBrowser(this.platfromId)) {
      const loggedInUserStr: string | null = localStorage.getItem('loggedInUser');

      if (loggedInUserStr) {
        const loggedInUser: LoggedInUser = JSON.parse(loggedInUserStr);

        this.memberService.getByUserName(loggedInUser.userName)?.pipe(take(1)).subscribe(member => {
          if (member) {
            this.member = member;

            this.initContollersValues(member);
          }
        });

      }
    }
  }

  userEditFg: FormGroup = this.fb.group({
    emailCtrl: ['', ],
    userNameCtrl: ['', ],
    passwordCtrl: ['', ]
  });

  get EmailCtrl(): AbstractControl {
    return this.userEditFg.get('emailCtrl') as FormControl;
  }
  get UserNameCtrl(): AbstractControl {
    return this.userEditFg.get('userNameCtrl') as FormControl;
  }
  get PasswordCtrl(): AbstractControl {
    return this.userEditFg.get('passwordCtrl') as FormControl;
  }

  initContollersValues(member: Member) {
    this.EmailCtrl.setValue(member.email);
    this.UserNameCtrl.setValue(member.userName);
    this.PasswordCtrl.setValue(member.password);
  }

  updateUser(): void {
    if (this.member) {
      let updateMember: MemberUpdate = {
        email: this.EmailCtrl.value,
        userName: this.UserNameCtrl.value,
        password: this.PasswordCtrl.value
      }

      this.memberService.updateUser(updateMember)
        .pipe(take(1))
        .subscribe({
          next: (response: ApiResponse) => {
            if (response.message) {
              this.matSnak.open(response.message, "Close", { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 10000 });
            }
          }
        });

      this.userEditFg.markAsPristine();
    }
  }
}