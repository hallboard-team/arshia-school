import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManagerService } from '../../../../services/manager.service';
import { RegisterUser } from '../../../../models/register-user.model';
import { GenericRegisterFormComponent } from '../shared/generic-register/generic-register.component';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule, GenericRegisterFormComponent],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.scss'
})
export class RegisterStudentComponent {
  private snackBar = inject(MatSnackBar);
  private managerService = inject(ManagerService);

  @ViewChild(GenericRegisterFormComponent) registerForm!: GenericRegisterFormComponent;

  isLoading = false;

  onFormSubmit(userData: RegisterUser): void {
    this.isLoading = true;

    this.managerService.createStudent(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('دانشجو با موفقیت ثبت شد.', 'باشه', { panelClass: 'snack-success', duration: 4000 });
        this.registerForm.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        const msgs: string[] = Array.isArray(err?.error) ? err.error : (Array.isArray(err?.error?.errors) ? err.error.errors : []);
        
        if (msgs.length) {
          this.registerForm.setServerErrors(msgs);
          this.snackBar.open(msgs.join('\n'), 'باشه', { panelClass: 'snack-error', duration: 4000 });
        } else {
          this.snackBar.open('خطا در ثبت نام دانشجو', 'باشه', { panelClass: 'snack-error', duration: 4000 });
        }
      }
    });
  }
}