import { Component, inject } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterUser } from '../../../models/register-user.model';
import { AddCourse } from '../../../models/course.model';
import { CourseService } from '../../../services/course.service';
import { Observable } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { AutoFocusDirective } from '../../../directives/auto-focus.directive';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatIconModule, NavbarComponent
  ],
  templateUrl: './add-course.component.html',
  styleUrl: './add-course.component.scss'
})
export class AddCourseComponent {
  fb = inject(FormBuilder);
  private _courseService = inject(CourseService);
  private _matSnackBar = inject(MatSnackBar);
  
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
      hourse: this.HourseCtrl.value,
      hoursePerClass: this.HoursePerClassCtrl.value,
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
}