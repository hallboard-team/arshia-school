import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { Member } from '../../../models/member.model';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, 
    RouterModule,
    MatCardModule, MatIconModule, NgPersianDatepickerModule
  ],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.scss'
})
export class StudentCardComponent {
  @Input('studentInput') studentIn: Member | undefined; // memberInput is a contract
  // @Output('unfollowUsernameOut') unfollowUsernameOut = new EventEmitter<string>();
  apiUrl = environment.apiUrl;

  isExpanded: boolean = false;
  selectedDate: string = '';
  // attendanceRecords: { date: string, status: string }[] = [];

  onDateSelected(date: string | undefined) {
    if (date) {
      this.selectedDate = date;
      console.log("Selected Date: ", this.selectedDate)
    }
  }

  markAttendance(status: string) {
    console.log(`Attendece for ${this.selectedDate}: ${status}`);
    // if (this.selectedDate) {
    //   this.attendanceRecords.push({ date: this.selectedDate, status});
    //   this.selectedDate = '';
    // }
  }

}
