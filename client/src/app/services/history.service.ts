import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: string[] = [];
  private future: string[] = [];
  private canGoBackSubject = new BehaviorSubject<boolean>(false);
  private canGoForwardSubject = new BehaviorSubject<boolean>(false);

  canGoBack$ = this.canGoBackSubject.asObservable();
  canGoForward$ = this.canGoForwardSubject.asObservable();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;

        if (this.history.length === 0 || this.history[this.history.length - 1] !== url) {
          this.history.push(url);
          this.future = [];
          this.updateSubjects();
        }
      });
  }

  private updateSubjects() {
    this.canGoBackSubject.next(this.history.length > 1);
    this.canGoForwardSubject.next(this.future.length > 0);
  }

  back(): string | null {
    if (this.history.length > 1) {
      const current = this.history.pop();
      if (current) this.future.unshift(current);
      this.updateSubjects();
      return this.history[this.history.length - 1];
    }
    return null;
  }

  forward(): string | null {
    if (this.future.length > 0) {
      const next = this.future.shift();
      if (next) {
        this.history.push(next);
        this.updateSubjects();
        return next;
      }
    }
    return null;
  }
}