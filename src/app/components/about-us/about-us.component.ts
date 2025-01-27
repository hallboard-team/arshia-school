import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    NavbarComponent, MatTabsModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
