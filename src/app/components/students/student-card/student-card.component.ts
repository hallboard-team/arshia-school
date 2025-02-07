import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { Member } from '../../../models/member.model';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, NgOptimizedImage,
    MatCardModule, MatIconModule
  ],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.scss'
})
export class StudentCardComponent {
  @Input('studentInput') studentIn: Member | undefined; // memberInput is a contract
  // @Output('unfollowUsernameOut') unfollowUsernameOut = new EventEmitter<string>();
  apiUrl = environment.apiUrl;

}
