import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Member } from '../../../models/member.model';
// import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import moment from 'moment-jalaali';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule,
    RouterModule, MatSlideToggleModule,
    MatCardModule, MatIconModule,
    ReactiveFormsModule
    // NgPersianDatepickerModule
  ],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.scss'
})
export class StudentCardComponent implements OnInit {
  @Input('studentInput') studentIn: Member | undefined;
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  private _teacherService = inject(TeacherService);
  private _snack = inject(MatSnackBar);
  private _accountService = inject(AccountService);
  private _route = inject(ActivatedRoute);

  isExpanded: boolean = false;
  message: string = '';

  // مقدار پیش‌فرض برای تاریخ، زمان فعلی (UTC)
  selectedDate: string = new Date().toISOString().split("T")[0];
  attendenceStatus: { [userName: string]: boolean } = {};

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    // console.log('THE LOGGED-IN USER:', this.loggedInUserSig()?.userName);
    console.log(this.studentIn);

    if (this.studentIn)
      this.attendenceStatus[this.studentIn.userName] = this.studentIn.isAbsent;

    // this.getAbsentStatus();

    const persianDate = new Date();
    this.selectedDate = moment(persianDate).format('jYYYY/jMM/jDD');
  }

  addAbsent(userName: string) {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      const attendanceData = {
        userName: userName,
        isAbsent: true
      };

      this._teacherService.addAttendence(attendanceData, courseTitle).subscribe({
        next: response => {
          // console.log("✅ حضور و غیاب ثبت شد:", response);
          this.attendenceStatus[userName] = true;
          // alert("حضور و غیاب ثبت شد.");
          this._snack.open(`غایب شد ${userName}`, 'close', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          })
        },
        error: err => {
          this._snack.open("خطا در ثبت حضور و غیاب!", 'close', {
            duration: 7000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          // alert("❌ خطا در ثبت حضور و غیاب!");
          // console.error(err);
        }
      });
    }


  }

  removeAttendence(userName: string) {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._teacherService.deleteAttendence(userName, courseTitle).subscribe({
        next: (response) => {
          this.attendenceStatus[userName] = false;
          this.message = response.message;
        },
        error: (error) => {
          this.message = error.error || 'khata dar sabt'
        }
      });
    }
  }
}