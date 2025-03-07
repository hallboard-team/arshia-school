import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getEnvironmentData } from 'worker_threads';
import { MemberService } from '../../../services/member.service';
import { EnrolledCourse } from '../../../models/helpers/enrolled-course.model';
import { environment } from '../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-member-enrolled-course',
  standalone: true,
  imports: [
    NavbarComponent
  ],
  templateUrl: './member-enrolled-course.component.html',
  styleUrl: './member-enrolled-course.component.scss'
})
export class MemberEnrolledCourseComponent implements OnInit{
  private _route = inject(ActivatedRoute);
  private _memberService = inject(MemberService);
  _apiPhotoUrl = environment.apiPhotoUrl;

  enrolledCourse: EnrolledCourse | undefined;

  ngOnInit() {
    this.getEnrolledCourse();
  }

  getEnrolledCourse(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._memberService.getEnrolledCourse(courseTitle)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.enrolledCourse = response;
          },
          error: (err) => {
            console.log('دوره یا پرداخت‌ها پیدا نشد', err);
          },
        });
    }
  }
}