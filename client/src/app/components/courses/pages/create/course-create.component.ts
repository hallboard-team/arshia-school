import { Component, inject } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { AutoFocusDirective } from '../../../../directives/auto-focus.directive';
import { CurrencyFormatterDirective } from '../../../../directives/currency-formatter.directive';
import { NavbarComponent } from '../../../navbar/navbar.component';
import { AddCourse } from '../../../../models/course.model';
import { CourseService } from '../../../../services/course.service';
import moment, { Moment } from 'moment-jalaali';
import { DatepickerComponent } from '../../../../datepicker/datepicker.component';

@Component({
  selector: 'app-add-course',
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule,
    AutoFocusDirective, DatepickerComponent,
    MatIconModule, NavbarComponent, CurrencyFormatterDirective
  ],
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss'
})
export class CourseCreateComponent {
  fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private _courseService = inject(CourseService);
  private _matSnackBar = inject(MatSnackBar);

  min = moment().startOf('day');
  max = moment().add(10, 'jYear').endOf('day');

  constructor(private http: HttpClient) { }

  courseFg = this.fb.group({
    titleCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    tuitionCtrl: ['', [Validators.required, Validators.pattern(/^[1-9]\d*000000$/)]],
    hourseCtrl: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(500)]],
    hoursePerClassCtrl: ['', [Validators.required, Validators.pattern(/^(?:[1-3](?:\.5)?|4)$/),
    Validators.min(1),
    Validators.max(4)
    ]],
    startCtrl: ['', [Validators.required]]
  });

  get TitleCtrl(): FormControl {
    return this.courseFg.get('titleCtrl') as FormControl;
  }
  get TuitionCtrl(): FormControl {
    return this.courseFg.get('tuitionCtrl') as FormControl;
  }
  get HourseCtrl(): FormControl {
    return this.courseFg.get('hourseCtrl') as FormControl;
  }
  get HoursePerClassCtrl(): FormControl {
    return this.courseFg.get('hoursePerClassCtrl') as FormControl;
  }
  get StartCtrl(): FormControl {
    return this.courseFg.get('startCtrl') as FormControl;
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this.snackBar.open(message, 'باشه', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'], direction: 'rtl' });
  }

  showErr(value: FormControl | null | undefined): boolean {
    return !!value && value.invalid && (value.dirty || value.touched);
  }

  private toGregorianDateOnly(value: Moment | Date | string | null | undefined): string | undefined {
    if (!value) return undefined;

    if (moment.isMoment(value)) {
      return value.locale('en').format('YYYY-MM-DD');
    }

    if (typeof value === 'string') {
      const m = moment(value);
      if (m.isValid()) {
        return m.locale('en').format('YYYY-MM-DD');
      }
      const d = new Date(value);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
    }

    const d = value as Date;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }

  createCourse(): void {
    const start = this.StartCtrl.value as any;

    if (!start || !start.isBetween(this.min, this.max, undefined, '[]')) {
      this.openSnack(
        `تاریخ شروع دوره باید بین ${this.min.format('jYYYY/jMM/jDD')} و ${this.max.format('jYYYY/jMM/jDD')} باشد.`,
        'error'
      );
      this.StartCtrl.markAsTouched();
      return;
    }

    let addCourse: AddCourse = {
      title: this.TitleCtrl.value,
      tuition: this.TuitionCtrl.value,
      hours: this.HourseCtrl.value,
      hoursPerClass: this.HoursePerClassCtrl.value,
      start: this.toGregorianDateOnly(start)
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
}