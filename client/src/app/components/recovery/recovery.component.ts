import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recovery',
  imports: [],
  templateUrl: './recovery.component.html',
  styleUrl: './recovery.component.scss'
})
export class RecoveryComponent {
  constructor(private router: Router) { }

  goHome(): void {
    this.router.navigateByUrl('/');
  }

  contact(): void {
    this.router.navigateByUrl('/');
  }
}