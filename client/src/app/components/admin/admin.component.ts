import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-admin',
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatButtonModule,
        MatSnackBarModule, MatRadioModule,
        MatDatepickerModule, MatNativeDateModule, AutoFocusDirective,
        MatTabsModule
    ],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {

}