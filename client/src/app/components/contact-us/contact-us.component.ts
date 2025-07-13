import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    NavbarComponent, MatIcon
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {

}