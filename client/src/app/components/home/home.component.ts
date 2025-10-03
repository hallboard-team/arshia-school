import {
  Component, Inject, OnDestroy, OnInit, PLATFORM_ID, Signal, inject,
  AfterViewInit, NgZone
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSliderModule } from '@angular/material/slider';
import { trigger, transition, style, animate } from '@angular/animations';

import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { MemberService } from '../../services/member.service';
import { UserProfile } from '../../models/user-profile.model';
import { Observable, Subscription } from 'rxjs';
import { Course, ShowCourse } from '../../models/course.model';
import { CourseParams } from '../../models/helpers/course-params';
import { CourseService } from '../../services/course.service';
import { Pagination } from '../../models/helpers/pagination';

@Component({
  selector: 'app-home',
  imports: [
    MatButtonModule, MatIconModule,
    RouterModule, MatInputModule, MatDividerModule,
    FormsModule, NavbarComponent, MatMenuModule,
    MatToolbarModule, MatSliderModule, CommonModule,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX({{ enterFrom }})' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { params: { enterFrom: '100%' } }),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateX({{ leaveTo }})' }))
      ], { params: { leaveTo: '-100%' } })
    ])
  ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private accountService = inject(AccountService);
  public memberService = inject(MemberService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  constructor(@Inject(DOCUMENT) private doc: Document) { }

  private autoTimerId: any = null;
  autoplayDelay = 4000;
  loop = true;

  private autoCourseTimerId: any = null;
  autoplayCourseDelay = 4000;
  private courseHoverPauseEnabled = false;

  loggedInUserSig: Signal<LoggedInUser | null> | undefined;
  courseService = inject(CourseService);
  courses$: Observable<Course[] | null> | undefined;

  profile: UserProfile | null = null;
  error: string | null = null;
  showCourses: ShowCourse[] | undefined;
  courseParams: CourseParams | undefined;
  subscribed: Subscription | undefined;
  pagination: Pagination | undefined;
  disableAnimation = false;

  direction: { value: string, params: { enterFrom: string, leaveTo: string } } = {
    value: '',
    params: { enterFrom: '100%', leaveTo: '-100%' }
  };

  slides = [
    {
      name: 'امیرعلی حسین پور',
      course: 'دوره پروژه محور FullStack',
      image: 'assets/images/profile-icon1.png',
      description:
        'از بین دوره هایی که گذروندم مثل ICDL, WordPress, Photoshop دوره FullStack رو دوست درم چون هدفم اینه برنامه نویس بشم...'
    },
    {
      name: 'آتنا عطائی',
      course: 'دوره WordPress',
      image: 'assets/images/profile-icon2.png',
      description:
        'دوره وردپرس برای من جذاب بود چون تدریس استاد عالی بود، استاد ملاجان باعث شدن که به وردپرس علاقمند بشم...'
    }
  ];

  sliderCourses = [
    { nameTitleCourse: 'Full-Stack 1', image: 'assets/images/full-stackPhoto.jpg', chapter: '-', hourse: '150', teacher: 'ارشیا رضایی , وحید حیاتی پور' },
    { nameTitleCourse: 'Full-Stack 2', image: 'assets/images/full-stackPhoto.jpg', chapter: '-', hourse: '150', teacher: 'پارسا جعفری , وحید حیاتی پور' },
    { nameTitleCourse: 'WordPress', image: 'assets/images/wordpressPhoto.jpg', chapter: '-', hourse: '60', teacher: 'مهدی ملاجان' },
    { nameTitleCourse: 'ICDL', image: 'assets/images/icdlPhoto.jpg', chapter: '-', hourse: '65', teacher: 'خانم محمودی' },
  ];

  currentIndex = 0;
  currentIndexCourse = 0;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const win = this.doc.defaultView as Window;
    win.requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.slides.length > 1 && !this.autoTimerId) this.startAuto();

        if (this.sliderCourses.length > 1 && !this.autoCourseTimerId) {
          this.startCourseAuto();
          setTimeout(() => { this.courseHoverPauseEnabled = true; }, this.autoplayCourseDelay + 25);
        }

        this.doc.addEventListener('visibilitychange', this.handleVisibility);
        this.doc.addEventListener('visibilitychange', this.handleCourseVisibility);
      }, 50);
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.clearAuto();
      this.clearCourseAuto();
      this.doc.removeEventListener('visibilitychange', this.handleVisibility);
      this.doc.removeEventListener('visibilitychange', this.handleCourseVisibility);
    }
  }

  private startAuto(): void {
    this.clearAuto();
    this.autoTimerId = setInterval(() => this.next(true), this.autoplayDelay);
  }
  private clearAuto(): void {
    if (this.autoTimerId) {
      clearInterval(this.autoTimerId);
      this.autoTimerId = null;
    }
  }
  pauseAuto(): void { this.clearAuto(); }
  resumeAuto(): void {
    if (isPlatformBrowser(this.platformId) && !this.autoTimerId) this.startAuto();
  }
  private handleVisibility = () => {
    if (this.doc.hidden) this.pauseAuto(); else this.resumeAuto();
  };

  next(fromAuto = false) {
    if (this.currentIndex < this.slides.length - 1) this.currentIndex++;
    else if (this.loop) this.currentIndex = 0;
    if (!fromAuto) this.startAuto();
  }
  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
    else if (this.loop) this.currentIndex = this.slides.length - 1;
    this.startAuto();
  }

  setDirection(dir: 'next' | 'prev') {
    this.direction = {
      value: dir,
      params: {
        enterFrom: dir === 'next' ? '100%' : '-100%',
        leaveTo: dir === 'next' ? '-100%' : '100%'
      }
    };
  }

  private startCourseAuto(): void {
    this.clearCourseAuto();
    this.autoCourseTimerId = setInterval(() => {
      this.ngZone.run(() => this.nextCourseAuto());
    }, this.autoplayCourseDelay);
  }
  private clearCourseAuto(): void {
    if (this.autoCourseTimerId) {
      clearInterval(this.autoCourseTimerId);
      this.autoCourseTimerId = null;
    }
  }

  pauseCourseAuto(): void {
    if (!this.courseHoverPauseEnabled) return;
    this.clearCourseAuto();
  }
  resumeCourseAuto(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.autoCourseTimerId) this.startCourseAuto();
  }

  private handleCourseVisibility = () => {
    if (this.doc.hidden) this.pauseCourseAuto(); else this.resumeCourseAuto();
  };

  private nextCourseAuto(): void {
    this.setDirection('next');
    this.currentIndexCourse = (this.currentIndexCourse + 1) % this.sliderCourses.length;
  }
  nextCourse(): void {
    this.setDirection('next');
    this.currentIndexCourse = (this.currentIndexCourse + 1) % this.sliderCourses.length;
    this.startCourseAuto();
  }
  prevCourse(): void {
    this.setDirection('prev');
    this.currentIndexCourse =
      (this.currentIndexCourse - 1 + this.sliderCourses.length) % this.sliderCourses.length;
    this.startCourseAuto();
  }

  logout(): void { this.accountService.logout(); }

  openMenu() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc.querySelectorAll('.hamburger-menu')
      .forEach(el => (el as HTMLElement).style.display = 'block');
  }
  closeMenu() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc.querySelectorAll('.hamburger-menu')
      .forEach(el => (el as HTMLElement).style.display = 'none');
  }
  openMenuDesctop() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc.querySelectorAll('.hamburger-menu')
      .forEach(el => (el as HTMLElement).style.display = 'block');
    this.doc.querySelectorAll('.right-open-menu')
      .forEach(el => (el as HTMLElement).style.display = 'none');
    this.doc.querySelectorAll('.right-close-menu')
      .forEach(el => (el as HTMLElement).style.display = 'flex');
  }
  closeMenuDesctop() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.doc.querySelectorAll('.hamburger-menu')
      .forEach(el => (el as HTMLElement).style.display = 'none');
    this.doc.querySelectorAll('.right-open-menu')
      .forEach(el => (el as HTMLElement).style.display = 'flex');
    this.doc.querySelectorAll('.right-close-menu')
      .forEach(el => (el as HTMLElement).style.display = 'none');
  }
}