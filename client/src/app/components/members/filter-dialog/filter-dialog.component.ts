import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MemberService } from '../../../services/member.service';
import { CourseService } from '../../../services/course.service';
import { MemberParams } from '../../../models/helpers/member-params';
import { MatButtonModule } from '@angular/material/button';
import { ShowCourseAndClass } from '../../../models/show-course-class.model';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-filter-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSliderModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatSelectModule
  ],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.scss'
})
export class FilterDialogComponent implements OnInit {
  private _memberService = inject(MemberService);
  private _fB = inject(FormBuilder);
  private _courseService = inject(CourseService);
  private _dialogRef = inject(MatDialogRef<FilterDialogComponent>);

  readonly minAge: number = 11;
  readonly maxAge: number = 99;

  memberParams: MemberParams | undefined;
  coursesAndClasses: ShowCourseAndClass[] | undefined;
  classes: string[] = [];
  titles: string[] = [];

  filterFg = this._fB.group({
    searchCtrl: [''],
    courseCtrl: [''],
    classCtrl: [''],
    minAgeCtrl: [this.minAge],
    maxAgeCtrl: [this.maxAge]
  })

  get SearchCtrl(): FormControl {
    return this.filterFg.get('searchCtrl') as FormControl;
  }

  get CourseCtrl(): FormControl {
    return this.filterFg.get('courseCtrl') as FormControl;
  }

  get ClassCtrl(): FormControl {
    return this.filterFg.get('classCtrl') as FormControl;
  }

  get MinAgeCtrl(): AbstractControl {
    return this.filterFg.get('minAgeCtrl') as FormControl;
  }

  get MaxAgeCtrl(): AbstractControl {
    return this.filterFg.get('maxAgeCtrl') as FormControl;
  }

  ngOnInit(): void {
    this.memberParams = new MemberParams();

    this.getCoursesAndClasses();
  }

  getCoursesAndClasses(): void {
    this._courseService.getCoursesAndClasses().subscribe({
      next: (res) => {
        this.classes = res.map(item => item.className);
        this.titles = res.map(item => item.title);
      }
    })
  }

  updateMemberParams(): void {
    if (this.memberParams) {
      this.memberParams.search = this.SearchCtrl.value;
      this.memberParams.minAge = this.MinAgeCtrl.value;
      this.memberParams.maxAge = this.MaxAgeCtrl.value;
      this.memberParams.courseTitle = this.CourseCtrl.value;
      this.memberParams.className = this.ClassCtrl.value;

      this._dialogRef.close(this.memberParams);
    }
  }

  reset(): void {
    this.SearchCtrl.reset();
    this.CourseCtrl.reset();
    this.ClassCtrl.reset();
    this.MinAgeCtrl.setValue(this.minAge);
    this.MaxAgeCtrl.setValue(this.maxAge);
  }
}
