import { Inject, Injectable, Optional } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateAdapterOptions
} from '@angular/material-moment-adapter';
import moment, { Moment } from 'moment-jalaali';

@Injectable()
export class JalaliMomentDateAdapter extends MomentDateAdapter {
  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS) options?: MatMomentDateAdapterOptions
  ) {
    super(dateLocale, options);
    // Enable Persian calendar + digits
    moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });
  }

  // --- Core Jalali math (with local midnight) ---
  override getYear(date: Moment): number {
    return date.jYear();
  }

  override getYearName(date: Moment): string {
    // Use Jalali year + Persian digits
    const faDigits = '۰۱۲۳۴۵۶۷۸۹';
    return date
      .jYear()
      .toString()
      .replace(/\d/g, d => faDigits[+d]);
  }

  override getMonth(date: Moment): number {
    return date.jMonth();
  }

  override getDate(date: Moment): number {
    return date.jDate();
  }

  // Persian digits helper
  private toFaDigits(s: string): string {
    const fa = '۰۱۲۳۴۵۶۷۸۹';
    return s.replace(/\d/g, d => fa[+d]);
  }

  // Use Persian digits for day numbers 1..31
  override getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => this.toFaDigits(String(i + 1)));
  }

  // (optional) Start week on Saturday for Iran
  override getFirstDayOfWeek(): number {
    return 6; // 0=Sun ... 6=Sat
  }

  override createDate(year: number, month: number, date: number): Moment {
    // Build a Jalali date at local midnight to avoid UTC drift.
    const d = moment().startOf('day').jYear(year).jMonth(month).jDate(date).locale('fa');

    // Guard against overflow (e.g., 1399/12/30 on a non-leap year)
    if (!d.isValid() || d.jYear() !== year || d.jMonth() !== month || d.jDate() !== date) {
      return moment.invalid();
    }
    return d.clone();
  }

  override today(): Moment {
    return moment().startOf('day').locale('fa');
  }

  // --- Parsing & formatting (Persian locale + strict parsing) ---
  override parse(value: any, parseFormat: string | string[]): Moment | null {
    if (!value) return null;
    if (typeof value === 'string') {
      // strict = true
      const m = moment(value, parseFormat, this.locale, true).locale('fa');
      return m.isValid() ? m.startOf('day') : null;
    }
    // For Moment/Date inputs, normalize to local midnight too
    const m = moment(value).locale('fa');
    return m.isValid() ? m.startOf('day') : null;
  }

  override format(date: Moment, displayFormat: string): string {
    return date ? date.locale('fa').format(displayFormat) : '';
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];
  }

  override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    switch (style) {
      case 'long':
        return ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
      case 'short':
      case 'narrow':
        return ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
    }
  }
}
