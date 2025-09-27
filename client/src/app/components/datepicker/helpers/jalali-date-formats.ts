import { MatDateFormats } from '@angular/material/core';

export const JALALI_MOMENT_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'jYYYY/jMM/jDD',
  },
  display: {
    dateInput: 'jYYYY/jMM/jDD',
    monthYearLabel: 'jMMMM jYYYY',   // e.g. مهر ۱۴۰۴
    dateA11yLabel: 'jYYYY/jMM/jDD',
    monthYearA11yLabel: 'jMMMM jYYYY',
  },
};
