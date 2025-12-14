import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericRegisterComponent } from './generic-register.component';

describe('GenericRegisterComponent', () => {
  let component: GenericRegisterComponent;
  let fixture: ComponentFixture<GenericRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
