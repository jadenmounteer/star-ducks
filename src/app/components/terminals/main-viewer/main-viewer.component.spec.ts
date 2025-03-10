import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainViewerComponent } from './main-viewer.component';

describe('MainViewerComponent', () => {
  let component: MainViewerComponent;
  let fixture: ComponentFixture<MainViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
