import { TestBed } from '@angular/core/testing';

import { StarshipIconService } from './starship-icon.service';

describe('StarshipIconService', () => {
  let service: StarshipIconService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StarshipIconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
