import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePlotterMapComponent } from './course-plotter-map.component';

describe('CoursePlotterMapComponent', () => {
  let component: CoursePlotterMapComponent;
  let fixture: ComponentFixture<CoursePlotterMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePlotterMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoursePlotterMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
