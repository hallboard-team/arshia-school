import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { SecretaryService } from '../../services/secretary.service';
import { Subscription } from 'rxjs';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { RegisterUser } from '../../models/register-user.model';

@Component({
  selector: 'app-secretary',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule, 
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule, AutoFocusDirective
  ],
  templateUrl: './secretary.component.html',
  styleUrl: './secretary.component.scss'
})
export class SecretaryComponent {
  
}