import { CommonModule } from '@angular/common';
import { Component, inject, Input, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ShowCourse } from '../../../models/course.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-select-course-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatDividerModule,
    MatCardModule, MatIconModule
  ],
  templateUrl: './select-course-card.component.html',
  styleUrl: './select-course-card.component.scss'
})
export class SelectCourseCardComponent {
  @Input('selectCourseInput') courseIn: ShowCourse | undefined;

  private _accountService = inject(AccountService);

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}