import { Component, forwardRef, Input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Moment } from 'moment-jalaali';
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
    ...JALALI_DATE_PROVIDERS,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent {
  /** Optional min/max from parent */
  @Input() minDate?: Moment;
  @Input() maxDate?: Moment;
  @Input() label: string = 'تاریخ';

  value: Moment | null = null;

  writeValue(value: Moment | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: Moment | null) => void): void {
    this.onChange = fn;
  }

  // ---- ControlValueAccessor implementation ----

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // you can disable the input here if needed
  }

  onDateChange(date: Moment | null): void {
    this.value = date;
    this.onChange(date);  // Notify Angular of new value
    this.onTouched();     // Mark as touched
  }

  // Callbacks registered by Angular forms API
  private onChange: (value: Moment | null) => void = () => {
  };

  // ---- Event handlers ----

  private onTouched: () => void = () => {
  };
}
