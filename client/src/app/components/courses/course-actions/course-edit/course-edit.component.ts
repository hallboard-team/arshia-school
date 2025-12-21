import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Course, CourseUpdate, ShowCourse } from '../../../../models/course.model';
import { CourseService } from '../../../../services/course.service';
import { NavbarComponent } from '../../../navbar/navbar.component';
import { BackForwardButtonComponent } from "../../../back-forward-button/back-forward-button.component";

@Component({
  selector: 'app-course-update',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NavbarComponent,
    ReactiveFormsModule, MatRadioModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
    BackForwardButtonComponent
  ],
  templateUrl: './course-edit.component.html',
  styleUrl: './course-edit.component.scss'
})
export class CourseEditComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private _courseService = inject(CourseService);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _platformId = inject(PLATFORM_ID);

  course: Course | undefined;

  ngOnInit(): void {
    this.getCourse();
  }

  courseFg: FormGroup = this._fb.group({
    titleCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    descriptionCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
    totalMinutesCtrl: ['', [Validators.required, Validators.min(1)]],
    isActiveCtrl: [false, [Validators.required]]
  });

  get TitleCtrl(): FormControl { return this.courseFg.get('titleCtrl') as FormControl; }
  get DescriptionCtrl(): FormControl { return this.courseFg.get('descriptionCtrl') as FormControl; }
  get TotalMinutesCtrl(): FormControl { return this.courseFg.get('totalMinutesCtrl') as FormControl; }
  get IsActiveCtrl(): FormControl { return this.courseFg.get('isActiveCtrl') as FormControl; }

  getCourse(): void {
    if (isPlatformBrowser(this._platformId)) {
      this._route.paramMap.pipe(
        switchMap(params => {
          const courseTitle = params.get('courseTitle');
          return courseTitle ? this._courseService.getByTitle(courseTitle) : [];
        })
      ).subscribe({
        next: (course) => {
          if (course) {
            this.course = course;
            this.initControllersValues(course);
          }
        },
        error: (err) => {
          this.snackBar.open("خطا در دریافت اطلاعات دوره", "بستن", { duration: 4000 });
        }
      });
    }
  }

  initControllersValues(course: Course) {
    this.TitleCtrl.setValue(course.title);
    this.DescriptionCtrl.setValue(course.description);
    this.TotalMinutesCtrl.setValue(course.totalMinutes);
    this.IsActiveCtrl.setValue(course.isActive);
  }

  updateCourse(): void {
    if (!this.course || !this.courseFg.valid) {
      this.courseFg.markAllAsTouched(); 
      return;
    }

    this._route.paramMap.pipe(
      take(1), 
      
      switchMap(params => {
        const courseTitle = params.get('courseTitle');

        if (!courseTitle) return EMPTY;

        const updatedCourse: CourseUpdate = {
          title: this.TitleCtrl.value,
          description: this.DescriptionCtrl.value,
          totalMinutes: +this.TotalMinutesCtrl.value,
          isActive: this.IsActiveCtrl.value,
        };

        return this._courseService.update(updatedCourse, courseTitle);
      })
    ).subscribe({
      next: (course: ShowCourse) => {
        this.snackBar.open('دوره با موفقیت آپدیت شد.', 'بستن', {
          duration: 5000,
          panelClass: ['snack-success']
        });
      },
      error: (err) => {
        this.snackBar.open('خطا در ویرایش دوره', 'بستن', {
          duration: 5000,
          panelClass: ['snack-error']
        });
      }
    });
  }
}