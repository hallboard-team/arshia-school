import { Component, Input } from '@angular/core';
import { Attendence } from '../../../models/attendence.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { MatTableModule } from '@angular/material/table';
// import moment from 'moment';
import moment from 'jalali-moment';

@Component({
  selector: 'app-attendence-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, 
    RouterModule, MatTableModule,
    MatCardModule, MatIconModule, NgPersianDatepickerModule
  ],
  templateUrl: './attendence-card.component.html',
  styleUrl: './attendence-card.component.scss'
})
export class AttendenceCardComponent {
  @Input('attendenceInput') attendenceIn: Attendence | undefined; 

  dataSource: any[] = [];
  displayedColumns: string[] = ['date', 'absent'];

  ngOnInit(): void {
    if (this.attendenceIn) {
      this.dataSource = [this.attendenceIn];
    }
  }  

  toJalali(date: string | Date): string {
    console.log('📅 date received:', date);
    if (!date) return '';
    return moment(date).locale('fa').format('YYYY/MM/DD');
  }
}