import { TestBed } from '@angular/core/testing';

import { DirectionalArrowService } from './directional-arrow.service';

describe('DirectionalArrowService', () => {
  let service: DirectionalArrowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectionalArrowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
