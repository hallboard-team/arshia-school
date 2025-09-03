import { Component, inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { AccountService } from '../../services/account.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MemberService } from '../../services/member.service';
import { UserProfile } from '../../models/user-profile.model';
import { Observable, Subscription } from 'rxjs';
import { Course, ShowCourse } from '../../models/course.model';
import { CourseParams } from '../../models/helpers/course-params';
import { CourseService } from '../../services/course.service';
import { Pagination } from '../../models/helpers/pagination';
import { MatSliderModule } from '@angular/material/slider';
import { FooterComponent } from '../footer/footer.component';
import { trigger, transition, style, animate } from '@angular/animations';

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
export class HomeComponent implements OnInit {
  private accountService = inject(AccountService);
  public memberService = inject(MemberService);
  private platformId = inject(PLATFORM_ID);
  private autoTimerId: any = null;

  autoplayDelay = 4000;
  loop = true;

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

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;

    console.log('THE LOGGED-IN USER:', this.loggedInUserSig()?.userName);
  }

  direction: { value: string, params: { enterFrom: string, leaveTo: string } } = {
    value: '',
    params: { enterFrom: '100%', leaveTo: '-100%' }
  };

  slides = [
    {
      name: 'امیرعلی حسین پور', course: 'دوره پروژه محور FullStack', image: 'assets/images/profile-icon1.png',
      description: 'از بین دوره هایی که گذروندم مثل ICDL, Wordpress, Photoshop دوره FullStack رو دوست درم چون هدفم اینه برنامه نویس بشم، وبه ساده ترین شکل مهاجرت کنم چون پول زیادی در برنامه نویسی هست و نسبت به رشته های دیگه آسون تره'
    },
    { name: 'آتنا عطائی', course: 'دوره Wordpress', image: 'assets/images/profile-icon2.png', description: 'دوره وردپرس برای من جذاب بود چون تدریس استاد عالی بود، استاد ملاجان باعث شدن که به وردپرس علاقمند بشم بازار کارش خوبه و درآمد خوبی هم داره' }
  ];

  sliderCourses = [
    { nameTitleCourse: 'Full-Stack-1', image: 'assets/images/full-stackPhoto.jpg', chapter: '-', hourse: '150', teacher: 'ارشیا رضایی , وحید حیاطی پور' },
    { nameTitleCourse: 'Full-Stack-2', image: 'assets/images/full-stackPhoto.jpg', chapter: '-', hourse: '150', teacher: 'پارسا جعفری , وحید حیاطی پور' },
    { nameTitleCourse: 'Wordpress', image: 'assets/images/wordpressPhoto.jpg', chapter: '-', hourse: '60', teacher: 'مهدی ملاجان' },
    { nameTitleCourse: 'ICDL', image: 'assets/images/icdlPhoto.jpg', chapter: '-', hourse: '65', teacher: 'خانم محمودی' },
  ];

  currentIndex = 0;
  currentIndexCourse = 0;

  private startAuto(): void {
    this.clearAuto();
    this.autoTimerId = setInterval(() => {
      this.next(true);
    }, this.autoplayDelay);
  }

  private clearAuto(): void {
    if (this.autoTimerId) {
      clearInterval(this.autoTimerId);
      this.autoTimerId = null;
    }
  }

  pauseAuto(): void {
    this.clearAuto();
  }

  resumeAuto(): void {
    if (isPlatformBrowser(this.platformId) && !this.autoTimerId) {
      this.startAuto();
    }
  }

  private handleVisibility = () => {
    if (document.hidden) this.pauseAuto();
    else this.resumeAuto();
  };

  next(fromAuto = false) {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    } else if (this.loop) {
      this.currentIndex = 0;
    }

    if (!fromAuto) {
      this.startAuto();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.loop) {
      this.currentIndex = this.slides.length - 1;
    }
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

  nextCourse() {
    if (this.currentIndexCourse < this.sliderCourses.length - 1) {
      this.setDirection('next');
      this.currentIndexCourse++;
    }
  }

  prevCourse() {
    if (this.currentIndexCourse > 0) {
      this.setDirection('prev');
      this.currentIndexCourse--;
    }
  }

  logout(): void {
    this.accountService.logout();
  }

  openMenu() {
    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "block";
    });
  }

  closeMenu() {
    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
  }

  openMenuDesctop() {
    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "block";
    });

    const openMenu = document.querySelectorAll('.right-open-menu');

    openMenu.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    const closeMenu = document.querySelectorAll('.right-close-menu');

    closeMenu.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });
  }

  closeMenuDesctop() {
    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });

    const openMenu = document.querySelectorAll('.right-open-menu');

    openMenu.forEach((element) => {
      (element as HTMLElement).style.display = "flex";
    });

    const closeMenu = document.querySelectorAll('.right-close-menu');

    closeMenu.forEach((element) => {
      (element as HTMLElement).style.display = "none";
    });
  }
}