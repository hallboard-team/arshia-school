import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Course } from '../../models/course.model';
import { TeacherService } from '../../services/teacher.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { Member } from '../../models/member.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import moment from 'moment-jalaali';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
    selector: 'app-teacher',
    imports: [
        NavbarComponent, CommonModule, RouterModule
    ],
    templateUrl: './teacher.component.html',
    styleUrl: './teacher.component.scss'
})
export class TeacherComponent implements OnInit, OnDestroy {
  teacherService = inject(TeacherService);

  courses$: Observable<Course[] | null> | undefined;
  courses: (Course & { shamsiStart: string })[] | undefined;

  subscribed: Subscription | undefined;

  students: Member[] = [];
  selectedCourse: string | null = null;
  shamsiStartDate: string = '';

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
          this.courses = response.map(course => ({
            ...course,
            shamsiStart: moment(course.start).format('jYYYY/jMM/jDD')
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
      }
    });
  }
}