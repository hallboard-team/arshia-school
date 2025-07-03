import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getEnvironmentData } from 'worker_threads';
import { MemberService } from '../../../services/member.service';
import { EnrolledCourse } from '../../../models/helpers/enrolled-course.model';
import { environment } from '../../../../environments/environment.development';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import moment from 'jalali-moment';
import { Lightbox, LightboxModule } from 'ng-gallery/lightbox';
import { Gallery, GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { ManagerService } from '../../../services/manager.service';

@Component({
  selector: 'app-member-enrolled-course',
  standalone: true,
  imports: [
    NavbarComponent, MatTableModule, MatNativeDateModule,
    MatIconModule, CommonModule, GalleryModule,
    LightboxModule
  ],
  templateUrl: './member-enrolled-course.component.html',
  styleUrl: './member-enrolled-course.component.scss'
})
export class MemberEnrolledCourseComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _memberService = inject(MemberService);
  private _accountService = inject(AccountService);
  private _managerService = inject(ManagerService);
  private gallery = inject(Gallery);
  private lightbox = inject(Lightbox);
  _apiPhotoUrl = environment.apiPhotoUrl;

  enrolledCourse: EnrolledCourse | undefined;
  displayedColumns: string[] = ['amount', 'paidOn', 'method', 'photo'];
  dataSource: any[] = [];
  images: GalleryItem[] = [];

  openLightbox(index: number): void {
    const ref = this.gallery.ref('paymentGallery');
    ref.load(this.images);
    this.lightbox.open(index, 'paymentGallery');
  }

  // constructor(private lightbox: Lightbox) {}

  ngOnInit() {
    this.getEnrolledCourse();
  }

  toJalali(date: string): string {
    return moment(date).locale('fa').format('YYYY/MM/DD');
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US') + ' تومان';
  }

  setGalleryImages(): void {
    if (!this.enrolledCourse?.payments) return;

    this.images = this.enrolledCourse.payments.map(payment => {
      return new ImageItem({
        src: this._apiPhotoUrl + payment.photo?.url_enlarged,
        thumb: this._apiPhotoUrl + payment.photo?.url_165
      });
    });
  }

  getEnrolledCourse(): void {
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._memberService.getEnrolledCourse(courseTitle)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.enrolledCourse = response;
            this.dataSource = response.payments || [];
            this.setGalleryImages();
          },
          error: (err) => {
            console.log('دوره یا پرداخت‌ها پیدا نشد', err);
          },
        });
    }
  }

  getTargetEnrolledCourse(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._managerService.getTargetUserEnrolledCourse(memberUserName, courseTitle)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.enrolledCourse = response;
            this.dataSource = response.payments || [];
            this.setGalleryImages();
          },
          error: (err) => {
            console.log('دوره یا پرداخت‌ها پیدا نشد', err);
          },
        });
    }
  }
}