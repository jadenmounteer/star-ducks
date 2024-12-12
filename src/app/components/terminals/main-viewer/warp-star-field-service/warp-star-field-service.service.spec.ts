import { TestBed } from '@angular/core/testing';

import { WarpStarFieldServiceService } from './warp-star-field-service.service';

describe('WarpStarFieldServiceService', () => {
  let service: WarpStarFieldServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarpStarFieldServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
