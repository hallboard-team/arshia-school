import { Component, inject, Input, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { ShowClass } from '../../../models/class.model';
import { LoggedInUser } from '../../../models/logged-in-user.model';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-class-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule 
  ],
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.scss'
})
export class ClassCardComponent implements OnInit {
  @Input('classInput') classIn: ShowClass | undefined;

  private _accountService = inject(AccountService);
  loggedInUserSig: Signal<LoggedInUser | null> | undefined;

  ngOnInit(): void {
    this.loggedInUserSig = this._accountService.loggedInUserSig;
  }
}