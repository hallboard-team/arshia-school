import { CommonModule } from '@angular/common';
import {
  defaultTheme,
  IActiveDate,
  IDatepickerTheme,
  NgPersianDatepickerModule
} from '../../../../projects/ng-persian-datepicker/src/public-api';
// import { darkTheme } from './datepicker-theme/dark.theme';
// import { darkTheme } from '../../../../date;

import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddCourse } from '../../models/course.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '../../services/course.service';
// import { IDatepickerTheme } from '../../../../projects/ng-persian-datepicker/src/public-api';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule,
    RouterModule, MatCardModule, MatIconModule,
    NgPersianDatepickerModule, MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {
  fb = inject(FormBuilder);
  private _courseService = inject(CourseService);
  private _matSnackBar = inject(MatSnackBar);
  teacherService = inject(TeacherService);
  selectedDate: string = "";
  // selectedDate = new FormControl(new Date().valueOf());
  // dateValue = new FormControl(new Date().valueOf());

  uiIsVisible: boolean = true;
  uiTheme: IDatepickerTheme = defaultTheme;
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  addCourseFg = this.fb.group({
    titleCtrl: ['', [Validators.required]],
    tuitionCtrl: ['', [Validators.required]],
    hourseCtrl: ['', [Validators.required]],
    hoursePerClassCtrl: ['', [Validators.required]],
    startCtrl: ['', [Validators.required]]
  })

  get TitleCtrl(): FormControl {
    return this.addCourseFg.get('titleCtrl') as FormControl;
  }
  get TuitionCtrl(): FormControl {
    return this.addCourseFg.get('tuitionCtrl') as FormControl;
  }
  get HourseCtrl(): FormControl {
    return this.addCourseFg.get('hourseCtrl') as FormControl;
  }
  get HoursePerClassCtrl(): FormControl {
    return this.addCourseFg.get('hoursePerClassCtrl') as FormControl;
  }
  get StartCtrl(): FormControl {
    return this.addCourseFg.get('startCtrl') as FormControl;
  }

  add(): void {
    let addCourse: AddCourse = {
      title: this.TitleCtrl.value,
      tuition: this.TuitionCtrl.value,
      hours: this.HourseCtrl.value,
      hoursPerClass: this.HoursePerClassCtrl.value,
      start: this.StartCtrl.value
    }

    this._courseService.addCourse(addCourse).subscribe({
      next: (response) => {
        this._matSnackBar.open("دوره اضافه شد", "Close", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 10000
        });
      },
      error: (err) => {
        this._matSnackBar.open("در اضافه شدن دوره خطایی به وجود آمده", "Close", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 10000
        });
      }
    })
  }

  onSelect(date: IActiveDate) {
    // console.log(date);
    const selectedDate = date.shamsi;
    console.log("Selected Date:", selectedDate);

    this.StartCtrl.setValue(selectedDate);
  }
}