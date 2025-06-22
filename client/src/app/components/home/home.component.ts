import { Component, forwardRef, inject, NgModule, OnInit, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepHeader, MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
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
import { PaginatedResult } from '../../models/helpers/paginatedResult';
import { CourseService } from '../../services/course.service';
import { Pagination } from '../../models/helpers/pagination';
import { MatSliderModule } from '@angular/material/slider';
import { FooterComponent } from '../footer/footer.component';
import { trigger, transition, style, animate, AnimationEvent } from '@angular/animations';
@Component({
  selector: 'app-home',
  standalone: true,
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
        animate('400ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { params: { enterFrom: '100%' } }),

      transition(':leave', [
        animate('400ms ease', style({ opacity: 0, transform: 'translateX({{ leaveTo }})' }))
      ], { params: { leaveTo: '-100%' } })
    ])
  ]
})
export class HomeComponent implements OnInit {
  private accountService = inject(AccountService);
  public memberService = inject(MemberService);
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
    { name: 'ارشیا رضایی', course: 'دوره پروژه محور FullStack', image: 'assets/images/profile-icon1.png', description: 'من به تیم شما بابت پشتیبانی عالیتان از وبسایتتان تشکر میکنم. سوالات و مشکلات من به سرعت پاسخ داده میشن و همیشه یه راه حل مناسب برای هر مشکل پیدا میکنید این امر بسیار قابل ارزش است.' },
    { name: 'ملیکا جعفری', course: 'دوره پروژه محور ICDL', image: 'assets/images/profile-icon2.png', description: 'من به تیم شما بابت پشتیبانی عالیتان از وبسایتتان تشکر میکنم. سوالات و مشکلات من به سرعت پاسخ داده میشن و همیشه یه راه حل مناسب برای هر مشکل پیدا میکنید این امر بسیار قابل ارزش است.' },
  ];

  sliderCourses = [
    { nameTitleCourse: 'Full-Stack', image: 'assets/images/background-full-stack3-RS.jpg', chapter: '2', hourse: '300', teacher: ' وحید حیاطی پور' },
    { nameTitleCourse: 'C#', image: 'assets/images/background-full-stack2.jpg', chapter: '4', hourse: '400', teacher: 'پارسا جعفری' },
    { nameTitleCourse: 'Angular', image: 'assets/images/background-full-stack4.jpg', chapter: '2', hourse: '200', teacher: 'ارشیا رضایی' },
  ];

  currentIndex = 0;
  currentIndexCourse = 0;

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
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
      // (element as HTMLElement).style.left = "5%"; 
    });
  }

  closeMenu() {
    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      // (element as HTMLElement).style.left = "-100%", 
      (element as HTMLElement).style.display = "none";
    });
  }

  openMenuDesctop() {
    // document.body.style.backgroundColor = color; 

    const elements = document.querySelectorAll('.hamburger-menu');

    elements.forEach((element) => {
      (element as HTMLElement).style.display = "block";
      // (element as HTMLElement).style.left = "5%"; 
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
      // (element as HTMLElement).style.left = "-100%", 
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