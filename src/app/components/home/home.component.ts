import { Component, forwardRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepHeader, MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import {CdkStepper, CdkStepperModule} from '@angular/cdk/stepper';
import {NgTemplateOutlet} from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatStepperModule, MatButtonModule, MatIconModule,
    MatTabsModule, CdkStepperModule, CdkStepper,
    NgTemplateOutlet, RouterModule, MatDividerModule
  ], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // selectStepByIndex(index: number): void {
  //   this.selectedIndex = index;
  // }
 
}