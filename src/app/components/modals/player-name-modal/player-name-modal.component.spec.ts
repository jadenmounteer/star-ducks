import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerNameModalComponent } from './player-name-modal.component';

describe('PlayerNameModalComponent', () => {
  let component: PlayerNameModalComponent;
  let fixture: ComponentFixture<PlayerNameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerNameModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlayerNameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
