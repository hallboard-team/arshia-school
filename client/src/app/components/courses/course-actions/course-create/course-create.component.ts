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
import { DecimalFormatterDirective } from '../../../../directives/decimal-formatter.directive';
import { BackForwardButtonComponent } from "../../../back-forward-button/back-forward-button.component";
import { MatRadioModule } from '@angular/material/radio';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-course',
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule,
    MatIconModule, NavbarComponent,
    DecimalFormatterDirective, MatRadioModule,
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
    descriptionCtrl: ['', [Validators.required]],
    hoursCtrl: ['', [Validators.required, Validators.pattern(/^(0(\.\d+)?|[1-9]\d*(\.\d+)?)$/), Validators.min(0.5), Validators.max(20000)]],
    isStartedCtrl: ['', [Validators.required]]
  });

  get TitleCtrl(): FormControl {
    return this.courseFg.get('titleCtrl') as FormControl;
  }
  get DescriptionCtrl(): FormControl {
    return this.courseFg.get('descriptionCtrl') as FormControl;
  }
  get HoursCtrl(): FormControl {
    return this.courseFg.get('hoursCtrl') as FormControl;
  }
  get IsStartedCtrl(): FormControl {
    return this.courseFg.get('isStartedCtrl') as FormControl;
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this.snackBar.open(message, 'باشه', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panel === 'success' ? 'snack-success' : 'snack-error'], direction: 'rtl' });
  }

  showErr(value: FormControl | null | undefined): boolean {
    return !!value && value.invalid && (value.dirty || value.touched);
  }

  createCourse(): void {
    let addCourse: AddCourse = {
      title: this.TitleCtrl.value,
      description: this.DescriptionCtrl.value,
      hours: this.HoursCtrl.value,
      isStarted: this.IsStartedCtrl.value
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

  onCancel(): void {
    this.courseFg.reset();
    
    this.router.navigate(['/dashboard/courses'])
  }
}