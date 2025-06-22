import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AccountService } from './services/account.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from "ngx-spinner";
import { LightboxModule } from 'ngx-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, RouterOutlet, NgxSpinnerModule,
    NavbarComponent, FooterComponent, LightboxModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private accountService = inject(AccountService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.initUserOnPageRefresh();
  }

  initUserOnPageRefresh(): void {
    if (isPlatformBrowser(this.platformId)) {
      const loggedInUserStr = localStorage.getItem('loggedInUser');

      if (loggedInUserStr) {
        this.accountService.authorizeLoggedInUser();

        this.accountService.setCurrentUser(JSON.parse(loggedInUserStr))
      }
    }
  }
}