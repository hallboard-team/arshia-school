import { Component, inject } from '@angular/core';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';
import { RouterOutlet } from "@angular/router";
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-main-dashboard',
  imports: [RightSidebarComponent, RouterOutlet],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent {
  accountService = inject(AccountService);
  sidebarCollapsed = false;

  onSidebarState(v: boolean): void {
    this.sidebarCollapsed = v;
  }
}