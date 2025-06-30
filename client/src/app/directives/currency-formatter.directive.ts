import {
  Directive,
  HostListener,
  ElementRef,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Directive({
  selector: '[appCurrencyFormatter]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyFormatterDirective),
      multi: true
    }
  ]
})
export class CurrencyFormatterDirective implements ControlValueAccessor {
  private onChange = (_: any) => { };
  private onTouched = () => { };

  constructor(private el: ElementRef<HTMLInputElement>) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    const rawValue = value.replace(/,/g, '').replace(/[^\d]/g, '');
    const formattedValue = this.formatWithCommas(rawValue);
    this.el.nativeElement.value = formattedValue;
    this.onChange(rawValue);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value != null && value !== '') {
      const formatted = this.formatWithCommas(value.toString());
      this.el.nativeElement.value = formatted;
    } else {
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  private formatWithCommas(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}