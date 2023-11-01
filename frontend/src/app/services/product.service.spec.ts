import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService } from './product.service';
import { EncryptionService } from '../services/encryption.service';

describe('ProductService', () => {
  let productService: ProductService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, EncryptionService],
    });

    productService = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that there are no pending requests
  });

  it('should be created', () => {
    expect(productService).toBeTruthy();
  });

  it('should retrieve all products', () => {
    const mockProducts = [{ /* Provide mock product data here */ }];

    productService.getAllProductsInfo().subscribe((data) => {
      expect(data).toEqual(mockProducts);
    });

    const req = httpTestingController.expectOne('http://localhost:8081/products');
    expect(req.request.method).toBe('GET');

    req.flush(mockProducts);
  });

  it('should retrieve seller products', () => {
    const mockProducts = [{ /* Provide mock product data here */ }];

    productService.getSellerProductsInfo().subscribe((data) => {
      expect(data).toEqual(mockProducts);
    });

    const req = httpTestingController.expectOne('http://localhost:8081/products/seller');
    expect(req.request.method).toBe('GET');

    req.flush(mockProducts);
  });

  it('should create a product', () => {
    const mockProduct = { /* Provide mock product data here */ };

    productService.createProduct(mockProduct).subscribe((data) => {
      expect(data).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne('http://localhost:8081/products');
    expect(req.request.method).toBe('POST');

    req.flush(mockProduct);
  });

  it('should update a product', () => {
    const mockProduct = { id: 123, /* Provide other mock product data here */ };

    productService.updateProduct(mockProduct).subscribe((data) => {
      expect(data).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne(`http://localhost:8081/products/${mockProduct.id}`);
    expect(req.request.method).toBe('PUT');

    req.flush(mockProduct);
  });

  it('should delete a product', () => {
    const mockProduct = { id: 123, /* Provide other mock product data here */ };

    productService.deleteProduct(mockProduct).subscribe((data) => {
      expect(data).toEqual(mockProduct);
    });

    const req = httpTestingController.expectOne(`http://localhost:8081/products/${mockProduct.id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush(mockProduct);
  });
});
