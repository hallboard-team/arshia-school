import { Component, inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Member } from '../../models/member.model';
import { AdminService } from '../../services/admin.service';
import { map, Observable, Subscription, take } from 'rxjs';
import { ApiResponse } from '../../models/helpers/apiResponse.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { error } from 'console';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../../services/member.service';

@Component({
  selector: 'app-add-discription',
  standalone: true,
  imports: [
    MatTabsModule, CommonModule, FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSnackBarModule, MatRadioModule, 
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './add-discription.component.html',
  styleUrl: './add-discription.component.scss'
})
export class AddDiscriptionComponent{
 
}
