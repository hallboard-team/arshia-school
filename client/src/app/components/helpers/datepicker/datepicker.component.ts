import {Component, inject} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  JalaliMomentDateAdapter,
  JALALI_MOMENT_FORMATS,
} from '../../../jalali-date-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-datepicker',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatMomentDateModule
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  fb: FormBuilder = inject(FormBuilder);

  dateCtrl = this.fb.control(moment(), [Validators.required]);
}
