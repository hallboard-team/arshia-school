import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Course } from '../../models/course.model';
import { TeacherService } from '../../services/teacher.service';
import { response } from 'express';
import { NavbarComponent } from '../navbar/navbar.component';
import { Member } from '../../models/member.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [
    NavbarComponent, CommonModule
  ],
  templateUrl: './teacher.component.html',
  styleUrl: './teacher.component.scss'
})
export class TeacherComponent implements OnInit, OnDestroy{
  teacherService = inject(TeacherService);

  courses$: Observable<Course[] | null> | undefined;
  courses: Course[] | undefined;

  subscribed: Subscription | undefined;

  students: Member[] = []; 
  selectedCourse: string | null = null;
  
  ngOnInit(): void {
    this.getAllCourses();
  }

  ngOnDestroy(): void {
    this.subscribed?.unsubscribe();
  }

  getAllCourses(): void {
    this.teacherService.getCourse().subscribe({
        next: (response: Course[]) => {
          if (response) {
            this.courses = response;
          }
          console.log(response);
        },
        error: (err) => {
            console.error('Error fetching courses:', err);
        }
    });
  }

  getStudentsByCourseId(courseId: string): void {
    this.selectedCourse = courseId;
    this.teacherService.getStudents(courseId).subscribe({
      next: (res: Member[]) => {
        this.students = res;
      },
      error: (err) => console.error('خطا در دریافت دانش‌آموزان:', err)
    });
  }
}