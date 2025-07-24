import { Component, inject } from '@angular/core';
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
  IDatepickerTheme,
  NgPersianDatepickerModule
} from '../../../../../projects/ng-persian-datepicker/src/public-api';
import moment from 'moment-jalaali';
import { CurrencyFormatterDirective } from '../../../directives/currency-formatter.directive';
import { HttpClient } from '@angular/common/http';

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
    selector: 'app-add-course',
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

  onDateSelect(event: {
    shamsi: string;
    gregorian: string;
    timestamp: number;
  }): void {
    this.shamsiDisplayDate = event.shamsi;
    this.StartCtrl.setValue(new Date(event.gregorian));

    this.closeDatePicker();
  }

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