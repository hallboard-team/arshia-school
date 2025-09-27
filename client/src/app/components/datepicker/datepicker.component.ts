import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment-jalaali';
import { CommonModule } from "@angular/common";
import { JALALI_DATE_PROVIDERS } from './helpers/jalali-providers';

@Component({
  selector: 'app-datepicker',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [
    ...JALALI_DATE_PROVIDERS
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  fb: FormBuilder = inject(FormBuilder);

  dateCtrl = this.fb.control(moment(), [Validators.required]);

   // Example: min/max year limits
  minDate = moment().jYear(1390).startOf('jYear');  // 1390/01/01
  maxDate = moment().jYear(1410).endOf('jYear');    // 1410/12/29
}
