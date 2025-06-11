import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackForwardButtonComponent } from './back-forward-button.component';

describe('BackForwardButtonComponent', () => {
  let component: BackForwardButtonComponent;
  let fixture: ComponentFixture<BackForwardButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackForwardButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackForwardButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
