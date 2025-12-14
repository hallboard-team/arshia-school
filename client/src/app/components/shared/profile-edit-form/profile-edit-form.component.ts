import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DatepickerComponent } from '../../../datepicker/datepicker.component'; 
import moment, { Moment } from 'moment-jalaali';

@Component({
  selector: 'app-profile-edit-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,
    DatepickerComponent
  ],
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.scss']
})
export class ProfileEditFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() user: any;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<any>();

  editMode = false;
  minDob: Moment = moment().subtract(100, 'jYear').startOf('day');
  maxDob: Moment = moment().subtract(5, 'jYear').endOf('day');

  form: FormGroup = this.fb.group({
    name: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastName: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phoneNum: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    gender: [{ value: '', disabled: true }, [Validators.required]],
    dateOfBirth: [{ value: '', disabled: true }, [Validators.required]]
  });

  get f() { return this.form.controls; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.resetForm();
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.form.enable();
    } else {
      this.resetForm(); // Cancel changes
      this.form.disable();
    }
  }

  resetForm() {
    this.editMode = false;
    this.form.disable();
    
    // تبدیل دیتای ورودی به فرمت مناسب فرم
    let dobMoment = null;
    if (this.user.dateOfBirth) {
        dobMoment = moment(this.user.dateOfBirth);
    } else if (this.user.age) {
        // تخمین سال تولد اگر تاریخ دقیق نباشد
        const approxYear = new Date().getFullYear() - this.user.age;
        dobMoment = moment(`${approxYear}-01-01`, 'YYYY-MM-DD');
    }

    const rawPhone = this.user.phoneNum ?? '';
    const phoneForInput = rawPhone.startsWith('98') && rawPhone.length === 12 
        ? rawPhone.substring(2) 
        : rawPhone;

    this.form.patchValue({
        name: this.user.name,
        lastName: this.user.lastName,
        phoneNum: phoneForInput,
        gender: this.user.gender?.toLowerCase(),
        dateOfBirth: dobMoment?.isValid() ? dobMoment : null
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    // تبدیل تاریخ و آماده سازی برای ارسال
    const dobValue = this.f['dateOfBirth'].value;
    const dobGregorian = this.toGregorianDateOnly(dobValue);

    const payload = {
        name: this.f['name'].value,
        lastName: this.f['lastName'].value,
        phoneNum: '98' + this.f['phoneNum'].value,
        gender: this.f['gender'].value,
        dateOfBirth: dobGregorian
    };

    this.formSubmit.emit(payload);
    // بعد از سابمیت موفق، مود ادیت باید توسط والد هندل بشه یا همینجا:
    // فعلا همینجا غیرفعال میکنیم تا نتیجه بیاد
    this.editMode = false;
    this.form.disable();
  }

  private toGregorianDateOnly(value: any): string | undefined {
    if (!value) return undefined;
    if (moment.isMoment(value)) return value.locale('en').format('YYYY-MM-DD');
    const d = new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
  }
}