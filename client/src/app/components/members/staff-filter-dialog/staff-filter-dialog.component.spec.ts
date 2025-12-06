import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffFilterDialogComponent } from './staff-filter-dialog.component';

describe('StaffFilterDialogComponent', () => {
  let component: StaffFilterDialogComponent;
  let fixture: ComponentFixture<StaffFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
