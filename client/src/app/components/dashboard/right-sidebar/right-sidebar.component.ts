import {
  Component, computed, EventEmitter, HostBinding, inject, OnInit, Output, Signal, signal
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { UserProfile } from '../../../models/user-profile.model';
import { MemberService } from '../../../services/member.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-right-sidebar',
  imports: [RouterModule],
  templateUrl: './right-sidebar.component.html',
  styleUrl: './right-sidebar.component.scss'
})
export class RightSidebarComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  public memberService = inject(MemberService);

  loggedInUserSig: Signal<LoggedInUser | null> = signal<LoggedInUser | null>(null);
  userSig = computed<LoggedInUser | null>(() => this.loggedInUserSig?.() ?? null);
  profile: UserProfile | null = null;
  error: string | null = null;

  @Output() collapsedChange = new EventEmitter<boolean>();
  collapsed = signal(false);

  @HostBinding('class.collapsed')
  get hostCollapsed() { return this.collapsed(); }

  private readonly DEFAULT_COLLAPSED_ROUTES = [
    '/dashboard/about',
    '/dashboard/contact-us',
    '/dashboard/profile'
  ];

  ngOnInit(): void {
    if (this.accountService.loggedInUserSig) {
      this.loggedInUserSig = this.accountService.loggedInUserSig;
    }

    this.applyDefaultByRoute(this.router.url, true);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.applyDefaultByRoute(e.urlAfterRedirects || e.url, false));
  }

  private applyDefaultByRoute(url: string, isInitial: boolean): void {
    const shouldCollapse = this.DEFAULT_COLLAPSED_ROUTES.some(p => url.startsWith(p));

    const isMobile = typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 768px)').matches
      : false;

    if (isMobile) {
      if (!this.collapsed()) { this.collapsed.set(true); this.collapsedChange.emit(true); }
      return;
    }

    const target = shouldCollapse;
    if (this.collapsed() !== target) {
      this.collapsed.set(target);
      this.collapsedChange.emit(target);
    } else if (isInitial) {
      this.collapsedChange.emit(this.collapsed());
    }
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
    this.collapsedChange.emit(this.collapsed());
  }
}