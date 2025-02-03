import { Component, inject } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { AccountService } from '../../services/account.service';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddAttendence } from '../../models/add-attendence.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
    MatTableModule, MatIconModule
  ],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.scss'
})
export class TeacherComponent {
  
} 