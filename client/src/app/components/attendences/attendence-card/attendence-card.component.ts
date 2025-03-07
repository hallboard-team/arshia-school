import { Component, Input } from '@angular/core';
import { Attendence } from '../../../models/attendence.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

@Component({
  selector: 'app-attendence-card',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, 
    RouterModule,
    MatCardModule, MatIconModule, NgPersianDatepickerModule
  ],
  templateUrl: './attendence-card.component.html',
  styleUrl: './attendence-card.component.scss'
})
export class AttendenceCardComponent {
  @Input('attendenceInput') attendenceIn: Attendence | undefined; 
  

}