import { Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { JalaliMomentDateAdapter } from './jalali-date-adapter';
import { JALALI_MOMENT_FORMATS } from './jalali-date-formats';

export const JALALI_DATE_PROVIDERS: Provider[] = [
  {
    provide: DateAdapter,
    useClass: JalaliMomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  },
  { provide: MAT_DATE_FORMATS, useValue: JALALI_MOMENT_FORMATS },
  { provide: MAT_DATE_LOCALE, useValue: 'fa' },
  { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } }, // important
];
