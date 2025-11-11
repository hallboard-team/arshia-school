import { ChangeDetectionStrategy, Component, viewChild, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-us',
  imports: [
    NavbarComponent, MatTabsModule, MatDatepickerModule,
    MatInputModule, MatFormFieldModule, MatIconModule,
    MatExpansionModule, MatButtonModule, RouterModule
  ],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutUsComponent {
  accordion = viewChild.required(MatAccordion);

  step = signal(0);

  setStep(index: number): void {
    this.step.set(index);
  }

  nextStep(): void {
    this.step.update(i => i + 1);
  }

  prevStep(): void {
    this.step.update(i => i - 1);
  }
} 