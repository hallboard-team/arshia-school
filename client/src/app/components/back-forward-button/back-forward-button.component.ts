import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-back-forward-button',
    imports: [
        CommonModule, MatIcon
    ],
    templateUrl: './back-forward-button.component.html',
    styleUrl: './back-forward-button.component.scss'
})
export class BackForwardButtonComponent {
  history = inject(HistoryService);
  router = inject(Router);

  lastClicked: 'back' | 'forward' | null = null;

  goBack() {
    const prevUrl = this.history.back();
    if (prevUrl) {
      this.lastClicked = 'back';
      this.router.navigateByUrl(prevUrl);
    }
  }

  goForward() {
    const nextUrl = this.history.forward();
    if (nextUrl) {
      this.lastClicked = 'forward';
      this.router.navigateByUrl(nextUrl);
    }
  }
}