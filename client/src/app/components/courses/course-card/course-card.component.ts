import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ShowCourse } from '../../../models/course.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatCardModule, MatIconModule
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent implements OnInit {
  @Input('courseInput') courseIn: ShowCourse | undefined;

  private _accountService = inject(AccountService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}