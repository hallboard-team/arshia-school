import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { JALALI_DATE_PROVIDERS } from './helpers/jalali-providers';
import moment, { Moment } from 'moment-jalaali';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatIconModule,
  ],
  providers: [
    ...JALALI_DATE_PROVIDERS,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
})
export class DatepickerComponent implements ControlValueAccessor {
  /** Optional min/max from parent */
  @Input() minDate?: Moment;
  @Input() maxDate?: Moment;

  value: Moment | null = null;
  disabled = false;

  // ---- CVA callbacks ----
  private onChange: (value: Moment | null) => void = () => { };
  private onTouched: () => void = () => { };

  // ---- ControlValueAccessor impl ----
  writeValue(value: Moment | Date | string | null): void {
    if (!value) { this.value = null; return; }
    if (moment.isMoment(value)) this.value = value as Moment;
    else if (value instanceof Date) this.value = moment(value);
    else if (typeof value === 'string') this.value = moment(value);
    else this.value = null;
  }
  registerOnChange(fn: (value: Moment | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // ---- Event handlers ----
  onDateChange(e: MatDatepickerInputEvent<Moment | Date>): void {
    const m = e.value
      ? (moment.isMoment(e.value) ? (e.value as Moment) : moment(e.value as Date))
      : null;

    this.value = m;
    this.onChange(m);
    this.onTouched();
  }
}

// import { Component, inject, Input } from '@angular/core';
// import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import moment, { Moment } from 'moment-jalaali';
// import { CommonModule } from "@angular/common";
// import { JALALI_DATE_PROVIDERS } from './helpers/jalali-providers';

// @Component({
//   selector: 'app-datepicker',
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatDatepickerModule
//   ],
//   providers: [
//     ...JALALI_DATE_PROVIDERS
//   ],
//   templateUrl: './datepicker.component.html',
//   styleUrl: './datepicker.component.scss'
// })
// export class DatepickerComponent {
//  /** Optional min/max from parent */
//   @Input() minDate?: Moment;
//   @Input() maxDate?: Moment;

//   value: Moment | null = null;

//   // Callbacks registered by Angular forms API
//   private onChange: (value: Moment | null) => void = () => {};
//   private onTouched: () => void = () => {};

//   // ---- ControlValueAccessor implementation ----

//   writeValue(value: Moment | null): void {
//     this.value = value;
//   }

//   registerOnChange(fn: (value: Moment | null) => void): void {
//     this.onChange = fn;
//   }

//   registerOnTouched(fn: () => void): void {
//     this.onTouched = fn;
//   }

//   setDisabledState?(isDisabled: boolean): void {
//     // you can disable the input here if needed
//   }

//   // ---- Event handlers ----

//   onDateChange(date: Moment | null): void {
//     this.value = date;
//     this.onChange(date);
//     this.onTouched();
//   }
// }
