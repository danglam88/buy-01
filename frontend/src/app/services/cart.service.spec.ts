import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Product } from '../Models/Product';

describe('CartService', () => {
  let cartService: CartService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });

    cartService = TestBed.inject(CartService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(cartService).toBeTruthy();
  });

  it('should add product to cart', () => {
    const mockProduct: Product = {
      id: '1',
      name: 'Test Product',
      description: 'Product for testing',
      price: 10,
      quantity: 5,
      editable: true, 
      productMedia: []
    };

    const mockedResponse = { message: 'mockedMessage' };

    cartService.addToCart(mockProduct).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8083/order/item');
    expect(req.request.method).toEqual('POST');
  });

  it('should get cart', () => {
    const mockedResponse = { message: 'mockedMessage' };

    cartService.getCart().subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8083/order/item');
    expect(req.request.method).toEqual('GET');
  });

  it('should update product quantity in cart', () => {
    const mockedResponse = { message: 'mockedMessage' };
    const itemId = '123';
    

    cartService.changeQuantity(itemId, "456", 5).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8083/order/item/' + itemId);
    expect(req.request.method).toEqual('PUT');
  });

  it('should remove product from cart', () => {
    const mockedResponse = { message: 'mockedMessage' };
    const itemId = '123';
    

    cartService.removeFromCart(itemId).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8083/order/item/' + itemId);
    expect(req.request.method).toEqual('DELETE');
  });
})
