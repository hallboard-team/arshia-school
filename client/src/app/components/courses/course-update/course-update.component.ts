import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormGroup, Validators, AbstractControl, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { ApiResponse } from '../../../models/helpers/apiResponse.model';
import { MemberUpdate } from '../../../models/member-update.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Course, CourseUpdate } from '../../../models/course.model';
import { CourseService } from '../../../services/course.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ManagerService } from '../../../services/manager.service';
import { Teacher } from '../../../models/teacher.model';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-course-update',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NavbarComponent,
    ReactiveFormsModule, MatRadioModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './course-update.component.html',
  styleUrl: './course-update.component.scss'
})
export class CourseUpdateComponent implements OnInit{
  private _courseService = inject(CourseService);
  private _managerService = inject(ManagerService);

  private _matSnackBar = inject(MatSnackBar);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _platformId = inject(PLATFORM_ID);
  // isLoading = true;

  course: Course | undefined; 
  teachers: Teacher[] = [];

  ngOnInit(): void {
    this.getCourse();
  }

  courseEditFg: FormGroup = this._fb.group({
    titleCtrl: ['', ],
    // professorUserNameCtrl: ['', ],
    tuitionCtrl: ['', ],
    hoursCtrl: ['', ],
    hoursPerClassCtrl: ['', ],
    startCtrl: ['', ],
    isStartedCtrl: ['', ]
  });
  
  get TitleCtrl(): AbstractControl {
    return this.courseEditFg.get('titleCtrl') as FormControl;
  }
  // get ProfessorUserNameCtrl(): AbstractControl {
  //   return this.courseEditFg.get('professorUserNameCtrl') as FormControl;
  // }
  get TuitionCtrl(): AbstractControl {
    return this.courseEditFg.get('tuitionCtrl') as FormControl;
  }
  get HoursCtrl(): AbstractControl {
    return this.courseEditFg.get('hoursCtrl') as FormControl;
  }
  get HoursPerClassCtrl(): AbstractControl {
    return this.courseEditFg.get('hoursPerClassCtrl') as FormControl;
  }
  get StartCtrl(): AbstractControl {
    return this.courseEditFg.get('startCtrl') as FormControl;
  }
  get IsStartedCtrl(): AbstractControl {
    return this.courseEditFg.get('isStartedCtrl') as FormControl;
  }

  getCourse(): void {
    if (isPlatformBrowser(this._platformId)) {
      const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

      if (courseTitle) {
        this._courseService.getByTitle(courseTitle)?.pipe(take(1)).subscribe(course => {
          if (course) {
            this.course = course;

            this.initControllersValues(course);
          }
        });
      }
    }
  }

  initControllersValues(course: Course) {
    this.TitleCtrl.setValue(course.title);
    // this.ProfessorUserNameCtrl.setValue(course.professorsNames);
    this.TuitionCtrl.setValue(course.tuition);
    this.HoursCtrl.setValue(course.hours);
    this.HoursPerClassCtrl.setValue(course.hoursPerClass);
    this.StartCtrl.setValue(course.start);
    this.IsStartedCtrl.setValue(course.isStarted);
  }

  updateCourse(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (this.course && courseTitle) {
      let updatedCourse: CourseUpdate = {
        title: this.TitleCtrl.value,
        // professorUserName: this.ProfessorUserNameCtrl.value,
        tuition: this.TuitionCtrl.value,
        hours: this.HoursCtrl.value,
        hoursPerClass: this.HoursPerClassCtrl.value,
        start: this.StartCtrl.value,
        isStarted: this.IsStartedCtrl.value,
      }

      this._courseService.update(updatedCourse, courseTitle)
        .pipe(take(1))
        .subscribe({
          next: (course: Course) => {
            if (course) {
              this.course = course;

              this._matSnackBar.open("update successfull", "Close", {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 10000
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
        // this.isLoading = false;
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
}
