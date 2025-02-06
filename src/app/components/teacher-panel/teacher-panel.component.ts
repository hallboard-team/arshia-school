import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TeacherService } from '../../services/teacher.service';
import { Course } from '../../models/course.model';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-teacher-panel',
  standalone: true,
  imports: [],
  templateUrl: './teacher-panel.component.html',
  styleUrl: './teacher-panel.component.scss'
})
export class TeacherPanelComponent implements OnInit{
  teacherService = inject(TeacherService);
  courses$: Observable<Course[] | null> | undefined;
  courses: Course[] | undefined;
  private platformId = inject(PLATFORM_ID);
  
  ngOnInit(): void {
    this.getAllCourses();
  }

  getAllCourses(): void {
    this.teacherService.getCourse().subscribe({
        next: (res: Course[] | undefined) => {
            console.log(res);
        },
        error: (err) => {
            console.error('Error fetching courses:', err);
        }
    });
  }
}