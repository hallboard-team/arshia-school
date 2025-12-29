import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EMPTY, switchMap, take } from 'rxjs';
import { ShowSite, SiteUpdate } from '../../../../models/site.model';
import { SiteService } from '../../../../services/site.service';
import { BackForwardButtonComponent } from '../../../back-forward-button/back-forward-button.component';
import { NavbarComponent } from '../../../navbar/navbar.component';

@Component({
  selector: 'app-site-update',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    NavbarComponent,
    BackForwardButtonComponent
  ],
  templateUrl: './site-edit.component.html',
  styleUrl: './site-edit.component.scss'
})
export class SiteEditComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _siteService = inject(SiteService);
  private _snackBar = inject(MatSnackBar);
  private _platformId = inject(PLATFORM_ID); 

  site: ShowSite | undefined;
  siteNameFromRoute: string | null = null;

  siteFg: FormGroup = this._fb.group({
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    departmentCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    floorCtrl: ['', [Validators.required]],
    capacityCtrl: ['', [Validators.required, Validators.min(1)]]
  });

  get NameCtrl(): FormControl { return this.siteFg.get('nameCtrl') as FormControl; }
  get DepartmentCtrl(): FormControl { return this.siteFg.get('departmentCtrl') as FormControl; }
  get FloorCtrl(): FormControl { return this.siteFg.get('floorCtrl') as FormControl; }
  get CapacityCtrl(): FormControl { return this.siteFg.get('capacityCtrl') as FormControl; }

  ngOnInit(): void {
    this.getSite();
  }

  getSite(): void {
    if (isPlatformBrowser(this._platformId)) {
      
      this._route.paramMap.pipe(
        switchMap(params => {
          this.siteNameFromRoute = params.get('siteName');

          if (this.siteNameFromRoute) {
            return this._siteService.getSiteByName(this.siteNameFromRoute);
          } else {
            return EMPTY; 
          }
        })
      ).subscribe({
        next: (site) => {
          if (site) {
            this.site = site;
            this.initFormValues(site);
          }
        },
        error: (err) => {
          console.error(err);
          this.openSnack('خطا در دریافت اطلاعات سایت', 'error');
        }
      });
    }
  }

  initFormValues(site: ShowSite): void {
    this.NameCtrl.setValue(site.name);
    this.DepartmentCtrl.setValue(site.department);
    this.FloorCtrl.setValue(site.floor);
    this.CapacityCtrl.setValue(site.capacity);
  }

  updateSite(): void {
    if (this.siteFg.invalid || !this.siteNameFromRoute) return;

    const updatedSite: SiteUpdate = {
      name: this.NameCtrl.value,
      department: this.DepartmentCtrl.value,
      floor: +this.FloorCtrl.value,
      capacity: +this.CapacityCtrl.value
    };

    this._siteService.update(updatedSite, this.siteNameFromRoute)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.openSnack('سایت با موفقیت ویرایش شد', 'success');
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error || 'خطا در ویرایش سایت';
          this.openSnack(errorMsg, 'error');
        }
      });
  }

  private openSnack(message: string, panel: 'success' | 'error' = 'error'): void {
    this._snackBar.open(message, 'بستن', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: panel === 'success' ? ['snack-success'] : ['snack-error'],
      direction: 'rtl'
    });
  }
}