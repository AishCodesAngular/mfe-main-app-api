import { TestBed } from '@angular/core/testing';

import { MfeLoaderService } from './mfe-loader.service';

describe('MfeLoaderService', () => {
  let service: MfeLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MfeLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
