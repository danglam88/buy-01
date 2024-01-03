import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { OrderService } from './order.service';
import { EncryptionService} from './encryption.service';
import { environment } from 'src/environments/environment';

describe('OrderService', () => {
  let orderService: OrderService;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EncryptionService]
    });
    orderService = TestBed.inject(OrderService);
    router = TestBed.inject(Router);
    encryptionService = TestBed.inject(EncryptionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(orderService).toBeTruthy();
  });

  it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = orderService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
 
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 
  
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = orderService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = orderService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); 
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = orderService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should create an order', () => {
    const order = {
      order_status: "CREATED",
      payment_code: "CASH",
    };

    const mockedResponse = { message: 'mockedMessage' };

    orderService.createOrder(order).subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.orderUrl}`);
    expect(req.request.method).toEqual('POST');
  })

 it('should get order by orderId', () => {
    const orderId = 'mockedOrderId';
    const mockedResponse = { message: 'mockedMessage' };

    orderService.getOrderByOrderId(orderId).subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.orderUrl}/${orderId}`);
    expect(req.request.method).toEqual('GET');
  })

  it('should get client orders', () => {
    const mockedResponse = { message: 'mockedMessage' };

    orderService.getClientOrders().subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.clientOrderUrl}`);
    expect(req.request.method).toEqual('GET');
  })

  it('should get seller orders', () => {
    const mockedResponse = { message: 'mockedMessage' };

    orderService.getSellerOrderItems().subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.sellerOrderUrl}`);
    expect(req.request.method).toEqual('GET');
  })

  it('should cancel client order', () => {
    const orderId = 'mockedOrderId';
    const mockedResponse = { message: 'mockedMessage' };
    const orderData = {
      order_status: "CANCELLED",
      payment_code: "CASH",
    };

    orderService.cancelOrder(orderId, orderData).subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.orderUrl}/${orderId}`);
    expect(req.request.method).toEqual('PUT');
  })

  it('should remove order', () => {
    const orderId = 'mockedOrderId';
    const mockedResponse = { message: 'mockedMessage' };

    orderService.removeOrder(orderId).subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.orderUrl}/${orderId}`);
    expect(req.request.method).toEqual('DELETE');
  })

  it('should redo order', () => {
    const mockedResponse = { message: 'mockedMessage' };
    const orderId = 'mockedOrderId';

    orderService.redoOrder(orderId).subscribe(
      response => {
        expect(response).toEqual(mockedResponse);
      }
    );

    const req = httpTestingController.expectOne(`${environment.redoOrderUrl}`);
    expect(req.request.method).toEqual('POST');
  })

});
