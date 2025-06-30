import { Component, inject, OnInit } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddCourse } from '../../../models/course.model';
import { CourseService } from '../../../services/course.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { NavbarComponent } from '../../navbar/navbar.component';
import {
  defaultTheme,
  IActiveDate,
  IDatepickerTheme,
  NgPersianDatepickerModule
} from '../../../../../projects/ng-persian-datepicker/src/public-api';
import moment from 'moment-jalaali';
import { CurrencyFormatterDirective } from '../../../directives/currency-formatter.directive';
import { HttpClient } from '@angular/common/http';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule,
    AutoFocusDirective,
    MatIconModule, NavbarComponent,
    NgPersianDatepickerModule, CurrencyFormatterDirective
  ],
  templateUrl: './add-course.component.html',
  styleUrl: './add-course.component.scss'
})
export class AddCourseComponent {

  fb = inject(FormBuilder);
  private _courseService = inject(CourseService);
  private _matSnackBar = inject(MatSnackBar);

  uiIsVisible: boolean = true;
  uiTheme: IDatepickerTheme = defaultTheme;
  uiYearView: boolean = true;
  uiMonthView: boolean = true;
  uiHideAfterSelectDate: boolean = false;
  uiHideOnOutsideClick: boolean = false;
  uiTodayBtnEnable: boolean = true;

  shamsiDisplayDate: string = '';

  dateCtrl = new FormControl();

  constructor(private http: HttpClient) { }

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

  // ngOnInit() {
  //   const val = this.TuitionCtrl.value;
  //   if (val) {
  //     this.formattedTuition = Number(val).toLocaleString('fa-IR') + ' تومان';
  //   }
  // }

  // onDateChange(jalaliDate: string): void {
  //   const miladiDate = moment(jalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
  //   console.log('تاریخ میلادی ارسال به بک‌اند:', miladiDate);

  //   this.StartCtrl.setValue(miladiDate);  // ست کردن مقدار میلادی در فرم کنترل
  // }

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

  // onSelect(date: IActiveDate) {
  //   // console.log(date);
  //   const selectedDate = date.shamsi;
  //   console.log("Selected Date:", selectedDate);

  //   this.StartCtrl.setValue(selectedDate);
  // }
  // فاصله امروز تا تاریخ انتخاب‌شده باید <= 1 سال باشه

  // onSelect(date: IActiveDate) {
  //   moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

  //   const shamsi = date.shamsi; // مثل: 1404/03/13

  //   const isValidJalali = /^\d{4}\/\d{2}\/\d{2}$/.test(shamsi);
  //   if (!isValidJalali) {
  //     this._matSnackBar.open("تاریخ انتخاب شده معتبر نیست", "بستن", {
  //       duration: 5000,
  //       horizontalPosition: 'center',
  //       verticalPosition: 'bottom'
  //     });
  //     return;
  //   }

  //   // const miladiDate = moment(shamsi, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
  //   const miladiDate = moment(shamsi, 'jYYYY/jMM/jDD').toDate();
  //   const selected = new Date(miladiDate);
  //   const today = new Date();
  //   const oneYearLater = new Date();
  //   oneYearLater.setFullYear(today.getFullYear() + 1);

  //   if (selected > oneYearLater) {
  //     this._matSnackBar.open("تاریخ بیش از یک سال آینده مجاز نیست", "بستن", {
  //       duration: 5000,
  //       horizontalPosition: 'center',
  //       verticalPosition: 'bottom'
  //     });
  //     return;
  //   }

  //   this.shamsiDisplayDate = shamsi;
  //   this.StartCtrl.setValue(miladiDate);
  // }

  onDateSelect(event: {
    shamsi: string;
    gregorian: string;
    timestamp: number;
  }): void {
    this.shamsiDisplayDate = event.shamsi; // برای نمایش در input
    this.StartCtrl.setValue(new Date(event.gregorian)); // تاریخ میلادی برای ارسال

    this.closeDatePicker(); // بستن تقویم
  }

  // onSelect(date: IActiveDate) {
  //   const shamsi = date.shamsi;

  //   const isValidJalali = /^\d{4}\/\d{2}\/\d{2}$/.test(shamsi);
  //   if (!isValidJalali) {
  //     this._matSnackBar.open("تاریخ انتخاب شده معتبر نیست", "بستن", {
  //       duration: 5000,
  //       horizontalPosition: 'center',
  //       verticalPosition: 'bottom'
  //     });
  //     return;
  //   }

  //   const miladiDateObj = moment(shamsi, 'jYYYY/jMM/jDD').toDate(); // <-- ✅ create a real Date
  //   const today = new Date();
  //   const oneYearLater = new Date();
  //   oneYearLater.setFullYear(today.getFullYear() + 1);

  //   // if (miladiDateObj > oneYearLater) {
  //   //   this._matSnackBar.open("تاریخ بیش از یک سال آینده مجاز نیست", "بستن", {
  //   //     duration: 5000,
  //   //     horizontalPosition: 'center',
  //   //     verticalPosition: 'bottom'
  //   //   });
  //   //   return;
  //   // }

  //   console.log(miladiDateObj);

  //   this.shamsiDisplayDate = shamsi;
  //   this.StartCtrl.setValue(miladiDateObj); // ✅ not string
  // }

  // onSelect(date: IActiveDate) {
  //   const shamsi = date.shamsi; // مثل: 1404/03/12
  //   const gregorian = date.gregorian; // مثل: 2025-06-02

  //   console.log("شمسی:", shamsi, "میلادی:", gregorian);

  //   this.shamsiDisplayDate = shamsi;
  //   this.StartCtrl.setValue(gregorian); // به بک‌اند مقدار میلادی ارسال بشه
  // }

  openDatePicker() {
    const elements = document.querySelectorAll('.div-background-date-picker');
    const buttonClose = document.querySelectorAll('.close-date');
    const buttonOpen = document.querySelectorAll('.open-date');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    buttonClose.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    buttonOpen.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
  }

  closeDatePicker() {
    const elements = document.querySelectorAll('.div-background-date-picker');
    const buttonClose = document.querySelectorAll('.close-date');
    const buttonOpen = document.querySelectorAll('.open-date');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    buttonClose.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    buttonOpen.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });
  }
}