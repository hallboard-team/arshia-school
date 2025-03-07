import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCourseCardComponent } from './select-course-card.component';

describe('SelectCourseCardComponent', () => {
  let component: SelectCourseCardComponent;
  let fixture: ComponentFixture<SelectCourseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCourseCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectCourseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
