import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetUserProfileComponent } from './target-user-profile.component';

describe('TargetUserProfileComponent', () => {
  let component: TargetUserProfileComponent;
  let fixture: ComponentFixture<TargetUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetUserProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
