import { Component, inject, OnInit, Signal } from '@angular/core';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GalleryModule, Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { Lightbox, LightboxModule } from 'ng-gallery/lightbox';
import { environment } from '../../../../environments/environment.development';
import { EnrolledCourse } from '../../../models/helpers/enrolled-course.model';
import { ManagerService } from '../../../services/manager.service';
import { AccountService } from '../../../services/account.service';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import moment from 'moment-jalaali';
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: false });

@Component({
  selector: 'app-target-member-enrolled-course',
  standalone: true,
  imports: [
    NavbarComponent, MatTableModule, MatNativeDateModule,
    MatIconModule, CommonModule, GalleryModule,
    LightboxModule, RouterModule
  ],
  templateUrl: './target-member-enrolled-course.component.html',
  styleUrl: './target-member-enrolled-course.component.scss'
})
export class TargetMemberEnrolledCourseComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _managerService = inject(ManagerService);
  private _accountService = inject(AccountService);
  private gallery = inject(Gallery);
  private lightbox = inject(Lightbox);
  _apiPhotoUrl = environment.apiPhotoUrl;

  enrolledCourse: EnrolledCourse | undefined;
  displayedColumns: string[] = ['amount', 'paidOn', 'method', 'photo'];
  dataSource: any[] = [];
  images: GalleryItem[] = [];
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  openLightbox(index: number): void {
    const ref = this.gallery.ref('paymentGallery');
    ref.load(this.images);
    this.lightbox.open(index, 'paymentGallery');
  }

  ngOnInit() {
    this.loggedInUserSig = this._accountService.loggedInUserSig;

    this.getTargetEnrolledCourse();
  }

  toJalali(date: string): string {
    return moment(date).format('jYYYY/jMM/jDD');
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

  getTargetEnrolledCourse(): void {
    const memberUserName: string | null = this._route.snapshot.paramMap.get('memberUserName');
    const courseTitle: string | null = this._route.snapshot.paramMap.get('courseTitle');

    if (courseTitle) {
      this._managerService.getTargetUserEnrolledCourse(memberUserName, courseTitle)
        .subscribe({
          next: (response) => {
            // console.log(response);
            response.payments.forEach(p => p.id = p.id.toString());

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