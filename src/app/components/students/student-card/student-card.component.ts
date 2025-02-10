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
import { TeacherService } from '../../../services/teacher.service';
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
  @Input('studentInput') studentIn: Member | undefined; 
  private _teacherService = inject(TeacherService);

  isExpanded: boolean = false;

  // مقدار پیش‌فرض برای تاریخ، زمان فعلی (UTC)
  selectedDate: string = new Date().toISOString().split("T")[0]; 

  markAttendance(status: string) {
    if (!this.studentIn?.userName) {
      alert("خطا: نام کاربری یافت نشد!");
      return;
    }

    const attendanceData = {
      userName: this.studentIn.userName,  
      isPresent: status === 'حاضر' // تبدیل "حاضر" به true و "غایب" به false
    };

    this._teacherService.addAttendence(attendanceData).subscribe({
      next: response => {
        console.log("✅ حضور و غیاب ثبت شد:", response);
        alert("حضور و غیاب ثبت شد.");
      },
      error: err => {
        alert("❌ خطا در ثبت حضور و غیاب!");
        console.error(err);
      }
    });
  }
}