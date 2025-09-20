import { Component, ElementRef, HostListener, Signal, ViewChild, inject } from '@angular/core';
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
import { AccountService } from '../../services/account.service';
import { LoggedInUser } from '../../models/logged-in-user.model';
import { MemberService } from '../../services/member.service';
import { UserProfile } from '../../models/user-profile.model';
import { BackForwardButtonComponent } from '../back-forward-button/back-forward-button.component';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule, RouterModule, NgOptimizedImage,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatDividerModule, MatListModule, MatTabsModule,
    MatSlideToggleModule, FormsModule, BackForwardButtonComponent
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
  showMobileMenu = false;

  @ViewChild('profilePanel') profilePanel!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;
  }

  logout(): void {
    this.accountService.logout();
    this.closeProfile();
  }

  openMenu() {
    this.showMobileMenu = true;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
  }

  closeMenu() {
    this.showMobileMenu = false;
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  }

  openProfile() {
    this.showProfile = true;
  }

  closeProfile() {
    this.showProfile = false;
    if (!this.showMobileMenu) document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.showProfile) return;
    const target = ev.target as Node;
    const panel = this.profilePanel?.nativeElement;
    if (panel && !panel.contains(target)) {
      this.closeProfile();
    }
  }

  toggleProfile(ev: MouseEvent) {
    ev.stopPropagation();
    this.showProfile = !this.showProfile;
    if (this.showProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      if (!this.showMobileMenu) document.body.style.overflow = '';
    }
  }
}