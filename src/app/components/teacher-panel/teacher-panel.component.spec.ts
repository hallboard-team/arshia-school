import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPanelComponent } from './teacher-panel.component';

describe('TeacherPanelComponent', () => {
  let component: TeacherPanelComponent;
  let fixture: ComponentFixture<TeacherPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
