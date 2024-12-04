import { ComponentFixture, TestBed } from '@angular/core/testing';

import { entranceCodeModalComponent } from './game-code-modal.component';

describe('entranceCodeModalComponent', () => {
  let component: entranceCodeModalComponent;
  let fixture: ComponentFixture<entranceCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [entranceCodeModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(entranceCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
