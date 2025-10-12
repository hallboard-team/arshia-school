import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, AbstractControl, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyFormatterDirective } from '../../../../directives/currency-formatter.directive';
import { Course, CourseUpdate } from '../../../../models/course.model';
import { Teacher } from '../../../../models/teacher.model';
import { CourseService } from '../../../../services/course.service';
import { ManagerService } from '../../../../services/manager.service';
import { NavbarComponent } from '../../../navbar/navbar.component';
import moment from 'moment-jalaali';
import { DatepickerComponent } from '../../../../datepicker/datepicker.component';

@Component({
  selector: 'app-course-update',
  imports: [
    CommonModule, FormsModule, NavbarComponent,
    ReactiveFormsModule, MatRadioModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, CurrencyFormatterDirective, MatProgressSpinnerModule,
    DatepickerComponent
  ],
  templateUrl: './course-edit.component.html',
  styleUrl: './course-edit.component.scss'
})
export class CourseEditComponent implements OnInit {
  private _courseService = inject(CourseService);
  private _managerService = inject(ManagerService);
  private _matSnackBar = inject(MatSnackBar);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _platformId = inject(PLATFORM_ID);

  course: Course | undefined;
  teachers: Teacher[] = [];

  professorUserNames: string[] = [];

  min = moment().startOf('day');
  max = moment().add(10, 'jYear').endOf('day');

  ngOnInit(): void {
    this.getCourse();
    console.log(this.course);
  }

  courseFg: FormGroup = this._fb.group({
    titleCtrl: ['',],
    tuitionCtrl: ['',],
    hoursCtrl: ['',],
    hoursPerClassCtrl: ['',],
    startCtrl: [null],
    isStartedCtrl: ['',]
  });

  get TitleCtrl(): FormControl { return this.courseFg.get('titleCtrl') as FormControl; }
  get TuitionCtrl(): FormControl { return this.courseFg.get('tuitionCtrl') as FormControl; }
  get HoursCtrl(): FormControl { return this.courseFg.get('hoursCtrl') as FormControl; }
  get HoursPerClassCtrl(): FormControl { return this.courseFg.get('hoursPerClassCtrl') as FormControl; }
  get StartCtrl(): FormControl { return this.courseFg.get('startCtrl') as FormControl; }
  get IsStartedCtrl(): FormControl { return this.courseFg.get('isStartedCtrl') as FormControl; }

  private toGregorianDateOnly(v: any): string | undefined {
    if (!v) return undefined;
    if (typeof v?.format === 'function') {
      return v.locale('en').format('YYYY-MM-DD');
    }
    const d = new Date(v);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toISOString()
      .slice(0, 10);
  }

  getCourse(): void {
    if (isPlatformBrowser(this._platformId)) {
      const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

      if (courseTitle) {
        this._courseService.getByTitle(courseTitle)?.pipe(take(1)).subscribe(course => {
          if (course) {
            this.course = course;
            this.professorUserNames = course.professorUserNames;

            this.initControllersValues(course);
          }
        });
      }
    }
  }

  initControllersValues(course: Course) {
    this.TitleCtrl.setValue(course.title);

    setTimeout(() => {
      this.TuitionCtrl.setValue(course.tuition);
    });

    this.HoursCtrl.setValue(course.hours);
    this.HoursPerClassCtrl.setValue(course.hoursPerClass);

    const startMoment = course.start ? moment(course.start) : null;
    this.StartCtrl.setValue(startMoment && startMoment.isValid() ? startMoment : null);

    this.IsStartedCtrl.setValue(course.isStarted);
  }

  updateCourse(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (this.course && courseTitle) {
      const start = this.StartCtrl.value as any;

      if (!start || !start.isBetween(this.min, this.max, undefined, '[]')) {
        this._matSnackBar.open(
          `تاریخ شروع دوره باید بین ${this.min.format('jYYYY/jMM/jDD')} و ${this.max.format('jYYYY/jMM/jDD')} باشد.`,
          'Close',
          { horizontalPosition: 'center', verticalPosition: 'bottom', duration: 8000 }
        );
        this.StartCtrl.markAsTouched();
        return;
      }

      const updatedCourse: CourseUpdate = {
        title: this.TitleCtrl.value,
        tuition: this.TuitionCtrl.value,
        hours: this.HoursCtrl.value,
        hoursPerClass: this.HoursPerClassCtrl.value,
        start: this.toGregorianDateOnly(start),
        isStarted: this.IsStartedCtrl.value,
      };

      this._courseService.update(updatedCourse, courseTitle)
        .pipe(take(1))
        .subscribe({
          next: (course: Course) => {
            if (course) {
              this.course = course;
              this._matSnackBar.open("update successfull", "Close", {
                horizontalPosition: 'center', verticalPosition: 'bottom', duration: 10000
              });
            }
          }
        });
    }
  }

  getTeachers(): void {
    this._managerService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
      },
      error: (error) => {
        this._matSnackBar.open("خطا در دریافت مدرسین", "Close", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 10000
        });
      }
    })
  }

  addProfessor(teacher: Teacher): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._courseService.addProfessorToCourse(courseTitle, teacher.userName).subscribe({
        next: (response) => {
          this._matSnackBar.open("مدرس به دوره اضافه شد", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
          this.professorUserNames.push(teacher.userName);
        },
        error: (err) => {
          this._matSnackBar.open("خطا در اضافه کردن مدرس به دوره", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
        }
      })
    }
  }

  removeProfessor(teacher: Teacher): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._courseService.removeProfessorFromCourse(courseTitle, teacher.userName).subscribe({
        next: (response) => {
          this._matSnackBar.open("مدرس از دوره حذف شد", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
          this.professorUserNames = this.professorUserNames.filter(u => u !== teacher.userName);
        },
        error: (err) => {
          this._matSnackBar.open("خطا در حذف کردن مدرس از دوره", "Close", {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 10000
          });
        }
      })
    }
  }

  openDivTeachers() {
    this.getTeachers();

    const divTeachers = document.querySelectorAll('.div-get-all-teachers');

    divTeachers.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    const divBtnGetTeachers = document.querySelectorAll('.div-btn-get-teachers');

    divBtnGetTeachers.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
  }

  closeDivTeachers() {
    const divTeachers = document.querySelectorAll('.div-get-all-teachers');

    divTeachers.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    const divBtnGetTeachers = document.querySelectorAll('.div-btn-get-teachers');

    divBtnGetTeachers.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });
  }

  isTeacherInCourse(teacher: Teacher): boolean {
    return this.professorUserNames.includes(teacher.userName);
  }
}