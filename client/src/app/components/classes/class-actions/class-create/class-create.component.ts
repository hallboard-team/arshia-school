import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { DatepickerComponent } from '../../../../datepicker/datepicker.component'; 
import { AddClass } from '../../../../models/class.model';
import { ShowCourse } from '../../../../models/course.model';
import { CourseParams, SiteParams } from '../../../../models/helpers/application-params';
import { ShowSite } from '../../../../models/site.model';
import { ClassService } from '../../../../services/class.service';
import { CourseService } from '../../../../services/course.service';
import { SiteService } from '../../../../services/site.service';
import { BackForwardButtonComponent } from '../../../back-forward-button/back-forward-button.component';
import { NavbarComponent } from '../../../navbar/navbar.component';
import moment, { Moment } from 'moment-jalaali'; 

@Component({
  selector: 'app-class-create',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatRadioModule, MatSelectModule,
    DatepickerComponent, 
    NavbarComponent,
    BackForwardButtonComponent, RouterModule
  ],
  templateUrl: './class-create.component.html',
  styleUrl: './class-create.component.scss'
})
export class ClassCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private _classService = inject(ClassService);
  private _courseService = inject(CourseService);
  private _siteService = inject(SiteService); 
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  courseList: ShowCourse[] = [];
  siteList: ShowSite[] = [];

  classFg = this.fb.group({
    classRoomNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    courseNameCtrl: ['', [Validators.required]],
    siteNameCtrl: ['', [Validators.required]],
    classMinutesCtrl: ['', [Validators.required, Validators.min(1)]],
    tuitionCtrl: ['', [Validators.required, Validators.min(0)]],
    startDateCtrl: ['', [Validators.required]],
    endedDateCtrl: ['', [Validators.required]],
    isStartedCtrl: [false, [Validators.required]],
    isActiveCtrl: [true, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadCourses();
    this.loadSites();
  }

  loadCourses(): void {
    const params = new CourseParams();
    params.pageSize = 50; 
    this._courseService.getAll(params).subscribe({
      next: res => {
        if (res.body) this.courseList = res.body;
      }
    });
  }

  loadSites(): void {
    const params = new SiteParams();
    params.pageSize = 50;
    this._siteService.getAll(params).subscribe({ 
      next: res => {
        if (res.body) this.siteList = res.body;
      }
    });
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

  // --- Getters ---
  get ClassRoomNameCtrl(): FormControl { return this.classFg.get('classRoomNameCtrl') as FormControl; }
  get CourseNameCtrl(): FormControl { return this.classFg.get('courseNameCtrl') as FormControl; }
  get SiteNameCtrl(): FormControl { return this.classFg.get('siteNameCtrl') as FormControl; }
  get ClassMinutesCtrl(): FormControl { return this.classFg.get('classMinutesCtrl') as FormControl; }
  get TuitionCtrl(): FormControl { return this.classFg.get('tuitionCtrl') as FormControl; }
  get StartDateCtrl(): FormControl { return this.classFg.get('startDateCtrl') as FormControl; }
  get EndedDateCtrl(): FormControl { return this.classFg.get('endedDateCtrl') as FormControl; }
  get IsStartedCtrl(): FormControl { return this.classFg.get('isStartedCtrl') as FormControl; }
  get IsActiveCtrl(): FormControl { return this.classFg.get('isActiveCtrl') as FormControl; }

  createClass(): void {
    if (this.classFg.invalid) return;

    const start = this.toGregorianDateOnly(this.StartDateCtrl.value);
    const end = this.toGregorianDateOnly(this.EndedDateCtrl.value);
    
    if (!start || !end) {
        this.openSnack("لطفاً تاریخ‌های معتبر وارد کنید", 'error');
        return;
    }

    const addClass: AddClass = {
      classRoomName: this.ClassRoomNameCtrl.value,
      courseName: this.CourseNameCtrl.value,
      siteName: this.SiteNameCtrl.value,
      classRoomMinutes: +this.ClassMinutesCtrl.value, 
      tuition: +this.TuitionCtrl.value,
      startDate: start,
      endedDate: end
    };

    this._classService.addClass(addClass).subscribe({
      next: (response) => {
        this.openSnack("کلاس با موفقیت ایجاد شد", 'success');
        this.router.navigate(['/dashboard/classes']);
      },
      error: (err) => {
        console.error(err);
        this.openSnack("خطا در ایجاد کلاس. ممکن است نام تکراری باشد.", 'error');
      }
    });
  }

  onCancel(): void {
    this.classFg.reset();
    this.router.navigate(['/dashboard/classes']);
  }

  private openSnack(message: string, panel: 'success' | 'error'): void {
    this.snackBar.open(message, 'بستن', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'],
      direction: 'rtl'
    });
  }
}