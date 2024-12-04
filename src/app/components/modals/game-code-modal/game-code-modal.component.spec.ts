import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCodeModalComponent } from './game-code-modal.component';

describe('GameCodeModalComponent', () => {
  let component: GameCodeModalComponent;
  let fixture: ComponentFixture<GameCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCodeModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
