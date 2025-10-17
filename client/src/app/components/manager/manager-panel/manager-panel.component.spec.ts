import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageerPannelComponent } from './manager-panel.component';

describe('ManageerPannelComponent', () => {
  let component: ManageerPannelComponent;
  let fixture: ComponentFixture<ManageerPannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageerPannelComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageerPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
