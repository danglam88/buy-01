import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { Product } from '../Models/Product';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });

    cartService = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(cartService).toBeTruthy();
  });

  it('should add product to cart', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      description: 'Product for testing',
      price: 10,
      quantity: 5,
      editable: true
    };

    cartService.addToCart(product);

    const cart = cartService.getCart();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].product).toEqual(product);
  });

  it('should remove product from cart', () => {
    const productId = '1';
    const product: Product = {
      id: productId,
      name: 'Test Product',
      description: 'Product for testing',
      price: 10,
      quantity: 5,
      editable: true
    };

    cartService.addToCart(product);

    let cart = cartService.getCart();
    expect(cart.items.length).toBe(1);

    cartService.removeFromCart(productId);

    cart = cartService.getCart();
    expect(cart.items.length).toBe(0);
  });

  it('should change quantity of product in cart', () => {
    const productId = '1';
    const product: Product = {
      id: productId,
      name: 'Test Product',
      description: 'Product for testing',
      price: 10,
      quantity: 5,
      editable: true
    };

    cartService.addToCart(product);

    let cart = cartService.getCart();
    expect(cart.items.length).toBe(1);

    const newQuantity = 3;
    cartService.changeQuantity(productId, newQuantity);

    cart = cartService.getCart();
    expect(cart.items[0].quantity).toBe(newQuantity);
  });

});
