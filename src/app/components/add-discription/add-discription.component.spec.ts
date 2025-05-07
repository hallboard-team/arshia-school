import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiscriptionComponent } from './add-discription.component';

describe('AddDiscriptionComponent', () => {
  let component: AddDiscriptionComponent;
  let fixture: ComponentFixture<AddDiscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDiscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDiscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
