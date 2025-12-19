import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AddSite } from '../../../../models/site.model';
import { SiteService } from '../../../../services/site.service';
import { BackForwardButtonComponent } from '../../../back-forward-button/back-forward-button.component';
import { NavbarComponent } from '../../../navbar/navbar.component';

@Component({
  selector: 'app-site-create',
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
  templateUrl: './site-create.component.html',
  styleUrl: './site-create.component.scss'
})
export class SiteCreateComponent {
  fb = inject(FormBuilder);
  private _siteService = inject(SiteService);
  private _matSnackBar = inject(MatSnackBar);

  siteFg = this.fb.group({
    nameCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    departmentCtrl: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    floorCtrl: ['', [Validators.required]], 
    capacityCtrl: ['', [Validators.required, Validators.min(1)]] 
  });

  get NameCtrl(): FormControl {
    return this.siteFg.get('nameCtrl') as FormControl;
  }
  get DepartmentCtrl(): FormControl {
    return this.siteFg.get('departmentCtrl') as FormControl;
  }
  get FloorCtrl(): FormControl {
    return this.siteFg.get('floorCtrl') as FormControl;
  }
  get CapacityCtrl(): FormControl {
    return this.siteFg.get('capacityCtrl') as FormControl;
  }

  createSite(): void {
    if (this.siteFg.invalid) return;

    const addSite: AddSite = {
      name: this.NameCtrl.value,
      department: this.DepartmentCtrl.value,
      floor: this.FloorCtrl.value, 
      capacity: this.CapacityCtrl.value 
    };

    this._siteService.addSite(addSite).subscribe({
      next: (response) => {
        this._matSnackBar.open("سایت با موفقیت اضافه شد", "بستن", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['snack-success']
        });
        
        this.siteFg.reset(); 
      },
      error: (err) => {
        const errorMsg = err?.error || "در اضافه کردن سایت خطایی به وجود آمده";
        this._matSnackBar.open(errorMsg, "بستن", {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 5000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  onCancel(): void {
    this.siteFg.reset();
  }
}