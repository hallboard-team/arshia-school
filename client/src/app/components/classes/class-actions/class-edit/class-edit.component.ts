import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs';
import moment, { Moment } from 'moment-jalaali';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DatepickerComponent } from '../../../../datepicker/datepicker.component';
import { ClassService } from '../../../../services/class.service';
import { ManagerService } from '../../../../services/manager.service';
import { ShowClass, ClassUpdate } from '../../../../models/class.model';
import { environment } from '../../../../../environments/environment';
import { Teacher } from '../../../../models/teacher.model';
import { BackForwardButtonComponent } from '../../../back-forward-button/back-forward-button.component';
import { NavbarComponent } from '../../../navbar/navbar.component';

@Component({
  selector: 'app-class-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatRadioModule, MatIconModule, MatTooltipModule,
    NavbarComponent, BackForwardButtonComponent, DatepickerComponent,
    RouterModule
  ],
  templateUrl: './class-edit.component.html',
  styleUrl: './class-edit.component.scss'
})
export class ClassEditComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private _classService = inject(ClassService); 
  private _managerService = inject(ManagerService);
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _platformId = inject(PLATFORM_ID);

  classItem: ShowClass | undefined;
  teachers: Teacher[] = [];
  photoUrl = environment.apiPhotoUrl;
  professorUserNames: string[] = [];
  
  currentClassRoomName: string = '';
  
  isEditMode: boolean = false;

  classFg: FormGroup = this._fb.group({
    classRoomNameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    tuitionCtrl: ['', [Validators.required, Validators.min(0)]],
    classMinutesCtrl: ['', [Validators.required, Validators.min(1)]],
    startDateCtrl: [null, [Validators.required]],
    endedDateCtrl: [null, [Validators.required]],
    isStartedCtrl: [false, [Validators.required]],
    isActiveCtrl: [true, [Validators.required]]
  });

  ngOnInit(): void {
    this.getClass();
    this.getTeachers(); 
  }

  // --- Getters ---
  get ClassRoomNameCtrl(): FormControl { return this.classFg.get('classRoomNameCtrl') as FormControl; }
  get TuitionCtrl(): FormControl { return this.classFg.get('tuitionCtrl') as FormControl; }
  get ClassMinutesCtrl(): FormControl { return this.classFg.get('classMinutesCtrl') as FormControl; }
  get StartDateCtrl(): FormControl { return this.classFg.get('startDateCtrl') as FormControl; }
  get EndedDateCtrl(): FormControl { return this.classFg.get('endedDateCtrl') as FormControl; }
  get IsStartedCtrl(): FormControl { return this.classFg.get('isStartedCtrl') as FormControl; }
  get IsActiveCtrl(): FormControl { return this.classFg.get('isActiveCtrl') as FormControl; }

  getClass(): void {
    if (isPlatformBrowser(this._platformId)) {
      const nameFromRoute = this._route.snapshot.paramMap.get('classRoomName'); 

      if (nameFromRoute) {
        this.currentClassRoomName = nameFromRoute;
        
        this._classService.getClassByName(nameFromRoute).pipe(take(1)).subscribe({
            next: (data) => {
                if (data) {
                    this.classItem = data;
                    this.professorUserNames = data.professorUserNames || []; 
                    this.initFormValues(data);
                }
            },
            error: (err) => {
                this.openSnack('خطا در دریافت اطلاعات کلاس', 'error');
                this._router.navigate(['/dashboard/classes']);
            }
        });
      }
    }
  }

  initFormValues(data: ShowClass): void {
    this.ClassRoomNameCtrl.setValue(data.classRoomName);
    this.TuitionCtrl.setValue(data.tuition);
    this.ClassMinutesCtrl.setValue(data.classRoomMinutes);
    this.IsStartedCtrl.setValue(data.isStarted);
    this.IsActiveCtrl.setValue(data.isActive);

    if (data.startDate) {
        this.StartDateCtrl.setValue(moment(data.startDate));
    }
    if (data.endedDate) {
        this.EndedDateCtrl.setValue(moment(data.endedDate));
    }

    this.classFg.disable();
    this.isEditMode = false;
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.classFg.enable(); 
  }

  cancelEditMode(): void {
    this.isEditMode = false;
    this.classFg.disable();
    if (this.classItem) {
        this.initFormValues(this.classItem);
    }
  }

  updateClass(): void {
    if (this.classFg.invalid) return;

    const start = this.toGregorianDateOnly(this.StartDateCtrl.value);
    const end = this.toGregorianDateOnly(this.EndedDateCtrl.value);

    if(!start || !end) {
        this.openSnack('تاریخ‌ها نامعتبر هستند', 'error');
        return;
    }

    const isEndedCalc = new Date(end) < new Date();

    const updatedClass: ClassUpdate = {
        classRoomName: this.ClassRoomNameCtrl.value,
        tuition: +this.TuitionCtrl.value,
        classRoomMinutes: +this.ClassMinutesCtrl.value,
        startDate: start,
        endedDate: end,
        isStarted: this.IsStartedCtrl.value,
        isActive: this.IsActiveCtrl.value,
        isEnded: isEndedCalc, 
    };

    this._classService.update(updatedClass, this.currentClassRoomName)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.classItem = res;
          this.currentClassRoomName = res.classRoomName; 
          
          this.initFormValues(res);
          this.openSnack('کلاس با موفقیت ویرایش شد.', 'success');
        },
        error: (err) => {
            console.error(err);
            this.openSnack('خطا در ویرایش کلاس', 'error');
        }
      });
  }

  getTeachers(): void {
    this._managerService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
      },
      error: () => this.openSnack("خطا در دریافت لیست مدرسین", 'error')
    });
  }

  isTeacherInClass(teacher: Teacher): boolean {
    return this.professorUserNames.includes(teacher.userName);
  }

  addProfessor(teacher: Teacher): void {
    if (!this.currentClassRoomName) return;

    this._classService.addProfessor(this.currentClassRoomName, teacher.userName).subscribe({
      next: () => {
        this.openSnack(`استاد ${teacher.name} به کلاس اضافه شد`, 'success');
        this.professorUserNames.push(teacher.userName);
      },
      error: () => this.openSnack("خطا در افزودن استاد", 'error')
    });
  }

  removeProfessor(teacher: Teacher): void {
    if (!this.currentClassRoomName) return;

    this._classService.removeProfessor(this.currentClassRoomName, teacher.userName).subscribe({
      next: () => {
        this.openSnack(`استاد ${teacher.name} از کلاس حذف شد`, 'success');
        this.professorUserNames = this.professorUserNames.filter(u => u !== teacher.userName);
      },
      error: () => this.openSnack("خطا در حذف استاد", 'error')
    });
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

  private toGregorianDateOnly(value: Moment | Date | string | null | undefined): string | undefined {
    if (!value) return undefined;
    if (moment.isMoment(value)) return value.locale('en').format('YYYY-MM-DD');
    const d = new Date(value as any);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }
}