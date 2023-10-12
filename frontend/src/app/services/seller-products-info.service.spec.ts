import { TestBed } from '@angular/core/testing';

import { SellerProductsInfoService } from './seller-products-info.service';

describe('SellerProductsInfoService', () => {
  let service: SellerProductsInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerProductsInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
