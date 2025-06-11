import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-forward-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-forward-button.component.html',
  styleUrl: './back-forward-button.component.scss'
})
export class BackForwardButtonComponent {
  history = inject(HistoryService);
  router = inject(Router);

  goBack() {
    const prevUrl = this.history.back();
    if (prevUrl) this.router.navigateByUrl(prevUrl);
  }

  goForward() {
    const nextUrl = this.history.forward();
    if (nextUrl) this.router.navigateByUrl(nextUrl);
  }
}
