import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetMemberEnrolledCourseComponent } from './target-member-enrolled-course.component';

describe('TargetMemberEnrolledCourseComponent', () => {
  let component: TargetMemberEnrolledCourseComponent;
  let fixture: ComponentFixture<TargetMemberEnrolledCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetMemberEnrolledCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetMemberEnrolledCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
