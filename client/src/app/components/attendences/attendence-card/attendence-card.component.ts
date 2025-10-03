import { Component, Input } from '@angular/core';
import { Attendence } from '../../../models/attendence.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-attendence-card',
  imports: [
    CommonModule, FormsModule, MatCardModule,
    RouterModule, MatTableModule,
    MatCardModule, MatIconModule, MatNativeDateModule
  ],
  templateUrl: './attendence-card.component.html',
  styleUrl: './attendence-card.component.scss'
})
export class AttendenceCardComponent {
  @Input('attendenceInput') attendenceIn: Attendence[] = [];

  displayedColumns: string[] = ['date', 'absent'];
  dataSource: Attendence[] = [];

  ngOnInit(): void {
    if (this.attendenceIn && Array.isArray(this.attendenceIn)) {
      this.dataSource = this.attendenceIn;
    }
  }

  // toJalali(date: string | Date): string {
  //   if (!date) return '';
  //   return moment(date).locale('fa').format('YYYY/MM/DD');
  // }
}