import { TestBed } from '@angular/core/testing';

import { AllproductsInfoService } from './allproducts-info.service';

describe('AllproductsInfoService', () => {
  let service: AllproductsInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllproductsInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
