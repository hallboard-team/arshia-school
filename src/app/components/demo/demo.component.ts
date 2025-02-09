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
import { AddAttendenceDemo } from '../../models/add-attendence.model';
import { TeacherService } from '../../services/teacher.service';
import { MatFormFieldModule } from '@angular/material/form-field';
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

  addAttendenceFg = this.fb.group({
    userNameCtrl: ['', ],
    timeCtrl: ['', ],
    absentOrPresentCtrl: ['', ]
  })

  get UserNameCtrl(): FormControl {
    return this.addAttendenceFg.get('userNameCtrl') as FormControl;
  }
  get TimeCtrl(): FormControl {
    return this.addAttendenceFg.get('timeCtrl') as FormControl;
  }
  get AbsentOrPresentCtrl(): FormControl {
    return this.addAttendenceFg.get('absentOrPresentCtrl') as FormControl;
  }

  addAttendence(): void {
    //  const dob: string | undefined = this.getDateOnly(this.DateOfBirthCtrl.value);
  
    let attendenceDemo: AddAttendenceDemo = {
      userName: this.UserNameCtrl.value,
      time: this.TimeCtrl.value,
      absentOrPresent: this.AbsentOrPresentCtrl.value
    }
  
    this.teacherService.addAttendenceDemo(attendenceDemo).subscribe({
      next: user => console.log(user)
    });
  }

  onSelect(date: IActiveDate) {
    // console.log(date);
    const selectedDate = date.shamsi;
    console.log("Selected Date:", selectedDate);

    this.TimeCtrl.setValue(selectedDate);
  }
}