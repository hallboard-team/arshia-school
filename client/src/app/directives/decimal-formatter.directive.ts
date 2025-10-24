import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appDecimalFormatter]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DecimalFormatterDirective),
      multi: true,
    },
  ],
})
export class DecimalFormatterDirective implements ControlValueAccessor {
  private onChange = (_: any) => { };
  private onTouched = () => { };

  constructor(private el: ElementRef<HTMLInputElement>) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    let raw = (value || '').replace(/,/g, '');

    raw = raw.replace(/[^\d.]/g, '');

    const firstDot = raw.indexOf('.');
    if (firstDot !== -1) {
      raw =
        raw.slice(0, firstDot + 1) +
        raw.slice(firstDot + 1).replace(/\./g, '');
    }

    const [intPart = '', decPart] = raw.split('.');

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedValue =
      decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;

    this.el.nativeElement.value = formattedValue;

    this.onChange(raw);
  }

  @HostListener('blur') onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    if (value == null || value === '') {
      this.el.nativeElement.value = '';
      return;
    }

    const val = value.toString();
    const [intPart = '', decPart] = val.replace(/,/g, '').split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.el.nativeElement.value =
      decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean) {
    this.el.nativeElement.disabled = isDisabled;
  }
}