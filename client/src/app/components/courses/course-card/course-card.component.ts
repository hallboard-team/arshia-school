import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Course, ShowCourse } from '../../../models/course.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import moment from 'moment-jalaali';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatIconModule
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent implements OnInit {
  // @Input('courseInput') courseIn: ShowCourse | undefined;

  // private _accountService = inject(AccountService);

  // loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  // ngOnInit(): void {
  //   this.loggedInUserSig = this._accountService.loggedInUserSig;
  // }
  @Input('courseInput') courseIn: ShowCourse | undefined;

  shamsiStartDate: string = '';

  private _accountService = inject(AccountService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    if (this.courseIn?.start) {
      this.shamsiStartDate = moment(this.courseIn.start).format('jYYYY/jMM/jDD');
    }
  }
}