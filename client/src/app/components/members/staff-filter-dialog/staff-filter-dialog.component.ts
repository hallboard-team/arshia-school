import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-staff-filter-dialog',
  imports: [
    CommonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSliderModule, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatSelectModule, MatCheckboxModule
  ],
  templateUrl: './staff-filter-dialog.component.html',
  styleUrl: './staff-filter-dialog.component.scss'
})
export class StaffFilterDialogComponent implements OnInit {
  private _fB = inject(FormBuilder);
  private _courseService = inject(CourseService);
  private _dialogRef = inject(MatDialogRef<StaffFilterDialogComponent>);

  memberParams: MemberParams | undefined;
  roleOptions: string[] = ['teacher', 'secretary'];
  roleOptionsView: string[] = ['معلم', 'منشی']

  filterFg = this._fB.group({
    searchCtrl: [''],
    rolesCtrl: this._fB.array([])
  })

  get SearchCtrl(): FormControl {
    return this.filterFg.get('searchCtrl') as FormControl;
  }

  get RolesCtrl(): FormArray {
    return this.filterFg.get('rolesCtrl') as FormArray;
  }

  ngOnInit(): void {
    this.memberParams = new MemberParams();
  }

  updateMemberParams(): void {
    if (this.memberParams) {
      this.memberParams.search = this.SearchCtrl.value;

      if (this.RolesCtrl.length === 0) {
        this.memberParams.roles = [...this.roleOptions];
      } 
      else { 
        this.memberParams.roles = this.RolesCtrl.value;
      }

      this._dialogRef.close(this.memberParams);
    }
  }

  onRoleChange(event: MatCheckboxChange, role: string): void {
    if (event.checked) {
      this.RolesCtrl.push(new FormControl(role));
    }
    else {
      const index = this.RolesCtrl.controls.findIndex(x => x.value === role);
      this.RolesCtrl.removeAt(index);
    }
  }

  reset(): void {
    this.SearchCtrl.reset();

    while (this.RolesCtrl.length) {
      this.RolesCtrl.removeAt(0);
    }
  }
}
