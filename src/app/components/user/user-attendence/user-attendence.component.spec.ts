import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAttendenceComponent } from './user-attendence.component';

describe('UserAttendenceComponent', () => {
  let component: UserAttendenceComponent;
  let fixture: ComponentFixture<UserAttendenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAttendenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAttendenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
