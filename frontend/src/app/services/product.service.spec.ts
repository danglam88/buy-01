import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { ProductService } from './product.service';
import { EncryptionService } from '../services/encryption.service';

describe('ProductService', () => {
  let productService: ProductService;
  let encryptionService: EncryptionService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService, EncryptionService],
    });

    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    encryptionService = TestBed.inject(EncryptionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that there are no pending requests
  });

  it('should be created', () => {
    expect(productService).toBeTruthy();
  });

  it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = productService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); // Create a spy for router.navigate
  
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); // Mock the router.navigate method
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); // Mock the encryptionService.decrypt method
    const navigateSpy = spyOn(router, 'navigate'); // Mock the router.navigate method
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
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
