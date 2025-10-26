import { Component } from '@angular/core';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';
import { ManagerPanelComponent } from "../../manager/manager-panel/manager-panel.component";
import { MemberListComponent } from "../../members/member-list/member-list.component";
import { RouterOutlet } from "@angular/router";


@Component({
  selector: 'app-main-dashboard',
  imports: [RightSidebarComponent, RouterOutlet],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent {

}
