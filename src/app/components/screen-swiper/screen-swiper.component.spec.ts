import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenSwiperComponent } from './screen-swiper.component';

describe('ScreenSwiperComponent', () => {
  let component: ScreenSwiperComponent;
  let fixture: ComponentFixture<ScreenSwiperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenSwiperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScreenSwiperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
