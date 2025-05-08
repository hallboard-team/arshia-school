import { Component, forwardRef, inject, NgModule, OnInit, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepHeader, MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import {NgTemplateOutlet} from '@angular/common'; 
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, 
    RouterModule, MatInputModule, MatDividerModule,
    FormsModule, NavbarComponent, MatMenuModule,
    MatToolbarModule
  ], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  private accountService = inject(AccountService);
  public memberService = inject(MemberService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  profile: UserProfile | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.loggedInUserSig = this.accountService.loggedInUserSig;

    console.log('THE LOGGED-IN USER:', this.loggedInUserSig()?.userName);

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
  // selectStepByIndex(index: number): void {
    //   this.selectedIndex = index;
    // }
  // http = inject(HttpClient);
  // private readonly _apiUrl = environment.apiUrl + 'color/';
    
  // favoriteColor: string = '#ffffff';
    
  // ngOnInit(): void {
  //   this.http.get<{ color: string }>(this._apiUrl + 'get-color')
  //   .subscribe(response => {
  //     const userColor = response.color;
  //     this.applyBackgroundColor(userColor);
  //   })
  // }

  // submitColor() {
  //   this.http.post(this._apiUrl + 'set-color', { color: this.favoriteColor})
  //   .subscribe(response => {
  //     console.log('Color saved successfully', response);
  //   })
  // }

  // applyBackgroundColor(color: string) {
  //   document.body.style.backgroundColor = color; 
  //   const elements = document.querySelectorAll('.neumorphic-button, input[type="color"]'); 
  //   elements.forEach((element) => { 
  //     (element as HTMLElement).style.boxShadow = ` 
  //       8px 8px 15px ${color},
  //       -8px -8px 15px ${(color)} 
  //     `; 
  //   });
  // }

  // applyBackgroundColor(color: string) {
  //   document.body.style.backgroundColor = color; 
  //   const elements = document.querySelectorAll('.neumorphic-button, input[type="color"]'); 
  //   elements.forEach((element) => { 
  //     (element as HTMLElement).style.boxShadow = ` 
  //       8px 8px 15px ${this.darkenColor(color)},
  //       -8px -8px 15px ${this.lightenColor(color)} 
  //     `; 
  //   });
  // }
  
  // darkenColor(color: string): string 
  // { 
  //   return tinycolor(color).darken(20).toString(); 
  // } 
  
  // lightenColor(color: string): string {
  //    return tinycolor(color).lighten(20).toString();
  // }
}
