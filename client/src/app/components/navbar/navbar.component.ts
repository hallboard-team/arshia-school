import { Component, OnInit, Signal, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AccountService } from '../../services/account.service';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { MemberService } from '../../services/member.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, NgOptimizedImage,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatDividerModule, MatListModule, MatTabsModule,
    MatSlideToggleModule, FormsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public accountService = inject(AccountService);
  public memberService = inject(MemberService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  profile: UserProfile | null = null;
  error: string | null = null;

  showProfile = false;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;

    // this.getLoggedInProfile();
  }

  // getLoggedInProfile(): void {
  //   this.memberService.getProfile().subscribe({
  //     next: (data) => {
  //       this.profile = data;
  //     },
  //     error: (err) => {
  //       this.error = 'خطا در گرفتن یوزرنیم';
  //     }
  //   })
  // }

  logout(): void {
    this.accountService.logout();
    this.closeProfile();
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

  openProfile() {
    this.showProfile = true;
  }

  closeProfile() {
    this.showProfile = false;
  }
}