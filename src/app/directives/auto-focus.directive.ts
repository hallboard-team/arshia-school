import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective {
  
  private elRef = inject(ElementRef);

  name: string = '';

  ngOnInit(): void {
    
    this.name.toUpperCase();
    setTimeout(() => {
      this.elRef.nativeElement.focus();
    }, 200);
  }
}