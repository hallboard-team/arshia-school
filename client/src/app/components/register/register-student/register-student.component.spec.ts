import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:client/src/app/components/register/register-student/register-student.component.spec.ts
import { RegisterStudentComponent } from './register-student.component';

describe('RegisterStudentComponent', () => {
  let component: RegisterStudentComponent;
  let fixture: ComponentFixture<RegisterStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterStudentComponent);
========
import { RegisterTeacherComponent } from './register-teacher.component';

describe('RegisterTeacherComponent', () => {
  let component: RegisterTeacherComponent;
  let fixture: ComponentFixture<RegisterTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterTeacherComponent);
>>>>>>>> release/1.0.0-beta:client/src/app/components/register/register-teacher/register-teacher.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
