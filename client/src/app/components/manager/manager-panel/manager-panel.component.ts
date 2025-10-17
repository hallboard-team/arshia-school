import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NavbarComponent } from '../../navbar/navbar.component';
import { RegisterSecretaryComponent } from '../register/register-secretary/register-secretary.component';
import { RegisterStudentComponent } from '../register/register-student/register-student.component';
import { RegisterTeacherComponent } from '../register/register-teacher/register-teacher.component';

@Component({
  selector: 'app-manager-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    NavbarComponent,
    RegisterStudentComponent,
    RegisterTeacherComponent,
    RegisterSecretaryComponent
  ],
  templateUrl: './manager-panel.component.html',
  styleUrl: './manager-panel.component.scss'
})
export class ManagerPanelComponent { }
