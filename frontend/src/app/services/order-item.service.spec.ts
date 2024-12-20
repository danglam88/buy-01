import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';


import { OrderItemService } from './order-item.service';
import { EncryptionService} from './encryption.service';
import { environment } from 'src/environments/environment';

describe('OrderItemService', () => {
  let orderItemService: OrderItemService;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EncryptionService]
    });
    orderItemService = TestBed.inject(OrderItemService);
    router = TestBed.inject(Router);
    encryptionService = TestBed.inject(EncryptionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(orderItemService).toBeTruthy();
  });
  it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = orderItemService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
 
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 
  
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = orderItemService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = orderItemService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); 
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = orderItemService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should cancel order item', () => {
    const itemId = 'mockedItemId';
    const mockedResponse = { message: 'mockedMessage' };
    const itemData = {
      "productId": "123",
      "orderId": "456",
      "statusCode": "CANCELLED"
    };


    orderItemService.cancelOrderItem(itemId, itemData).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne(`${environment.cancelOrderItemUrl}/${itemId}`);
    expect(req.request.method).toEqual('PUT');
  })

  it('should redo order item', () => {
    const mockedResponse = { message: 'mockedMessage' };
    const itemData = {
      "itemId": "123",
      "orderId": "345",
      "productId": "678",
      "quantity":5
    };

    orderItemService.redoOrderItem(itemData).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne(`${environment.redoOrderItemUrl}`);
    expect(req.request.method).toEqual('POST');
  })

  it('should update order item status', () => {
    const itemId = 'mockedItemId';
    const mockedResponse = { message: 'mockedMessage' };
    const itemData = {
      "productId": "123",
      "orderId": "456",
      "statusCode": "CANCELLED"
    };

    orderItemService.updateOrderItemStatus(itemId, itemData).subscribe(response => {
      expect(response).toEqual(mockedResponse);
    });

    const req = httpTestingController.expectOne(`${environment.statusOrderItemUrl}/${itemId}`);
    expect(req.request.method).toEqual('PUT');
  });

});
