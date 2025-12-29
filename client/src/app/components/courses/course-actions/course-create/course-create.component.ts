import { Component, inject } from '@angular/core';
import { Validators, FormControl, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../navbar/navbar.component';
import { AddCourse } from '../../../../models/course.model';
import { CourseService } from '../../../../services/course.service';
import { BackForwardButtonComponent } from "../../../back-forward-button/back-forward-button.component";
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule,
    MatIconModule, NavbarComponent,
    MatRadioModule,
    BackForwardButtonComponent
  ],
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.scss'
})
export class CourseCreateComponent {
  fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private _courseService = inject(CourseService);
  private _matSnackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor(private http: HttpClient) { }

  courseFg = this.fb.group({
    titleCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    descriptionCtrl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]],
    totalTimeCtrl: ['', [Validators.required, Validators.min(1), Validators.max(20000)]],
    isActiveCtrl: [true, [Validators.required]] 
  });

  get TitleCtrl(): FormControl {
    return this.courseFg.get('titleCtrl') as FormControl;
  }
  get DescriptionCtrl(): FormControl {
    return this.courseFg.get('descriptionCtrl') as FormControl;
  }
  get TotalTimeCtrl(): FormControl {
    return this.courseFg.get('totalTimeCtrl') as FormControl;
  }
  get IsActiveCtrl(): FormControl {
    return this.courseFg.get('isActiveCtrl') as FormControl;
  }

  createCourse(): void {
    if (this.courseFg.invalid) return;

    let addCourse: AddCourse = {
      title: this.TitleCtrl.value,
      description: this.DescriptionCtrl.value,
      totalTime: this.TotalTimeCtrl.value, 
      isActive: this.IsActiveCtrl.value
    }

    this._courseService.addCourse(addCourse).subscribe({
      next: (response) => {
        this._matSnackBar.open("دوره با موفقیت اضافه شد", "بستن", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['snack-success']
        });
      },
      error: (err) => {
        this._matSnackBar.open("در اضافه شدن دوره خطایی به وجود آمده", "بستن", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['snack-error']
        });
      }
    })
  }

  onCancel(): void {
    this.courseFg.reset();
    
    this.router.navigate(['/dashboard/courses'])
  }
}