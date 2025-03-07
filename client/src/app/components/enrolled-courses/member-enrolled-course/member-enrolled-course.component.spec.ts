import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberEnrolledCourseComponent } from './member-enrolled-course.component';

describe('MemberEnrolledCourseComponent', () => {
  let component: MemberEnrolledCourseComponent;
  let fixture: ComponentFixture<MemberEnrolledCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberEnrolledCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberEnrolledCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
