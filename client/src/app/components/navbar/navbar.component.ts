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
  private accountService = inject(AccountService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;

    console.log('THE LOGGED-IN USER:', this.loggedInUserSig()?.userName);
  }
  
  logout(): void {
    this.accountService.logout();
  }

  openMenu() {
    // document.body.style.backgroundColor = color; 

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
}