import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';


@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [
    NavbarComponent, MatTabsModule, MatDatepickerModule,
    MatInputModule, MatFormFieldModule, MatIconModule,
    MatExpansionModule, MatButtonModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUsComponent {
  accordion = viewChild.required(MatAccordion);
}
