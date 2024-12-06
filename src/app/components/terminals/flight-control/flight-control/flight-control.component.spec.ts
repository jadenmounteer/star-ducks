import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightControlComponent } from './flight-control.component';

describe('FlightControlComponent', () => {
  let component: FlightControlComponent;
  let fixture: ComponentFixture<FlightControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlightControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
