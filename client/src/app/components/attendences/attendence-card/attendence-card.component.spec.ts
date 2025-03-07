import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendenceCardComponent } from './attendence-card.component';

describe('AttendenceCardComponent', () => {
  let component: AttendenceCardComponent;
  let fixture: ComponentFixture<AttendenceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendenceCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendenceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
