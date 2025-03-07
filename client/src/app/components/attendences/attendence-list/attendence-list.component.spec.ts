import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendenceListComponent } from './attendence-list.component';

describe('AttendenceListComponent', () => {
  let component: AttendenceListComponent;
  let fixture: ComponentFixture<AttendenceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendenceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
