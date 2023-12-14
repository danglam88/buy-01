package com.gritlab.unit;

import com.gritlab.controller.OrderController;
import com.gritlab.model.*;
import com.gritlab.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderControllerTest {

    private OrderController orderController;

    @Mock
    private OrderService orderService;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        orderController = new OrderController(orderService);
    }

    @Test
    void createOrderWhenValidInput_thenReturnOrderId() {

        // Request params
        OrderRequest request = new OrderRequest(OrderStatus.CREATED, Payment.CASH);

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        String newOrderId = "order-id1";

        when(orderService.addOrder(userDetails.getId(), request)).thenReturn(newOrderId);

        ResponseEntity<String> responseEntity = orderController.createOrder(authentication, request);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals(responseEntity.getBody(), newOrderId);
    }

    @Test
    void updateOrderWhenValidInput_thenReturn200() {

        // Request params
        OrderRequest request = new OrderRequest(OrderStatus.CREATED, Payment.CASH);

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        String orderId = "order-id1";

        ResponseEntity<Void> responseEntity = orderController.updateOrder(orderId, authentication, request);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    void deleteOrderWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        String orderId = "order-id1";

        // Call the controller method
        ResponseEntity<Void> responseEntity = orderController.deleteOrder(orderId, authentication);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    void getSellerOrderItemsWhenValidInput_thenReturnOrderItemHistory() {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("seller-id");

        OrderItemHistory orderItemHistory = new OrderItemHistory();
        when(orderService.getOrderItemsBySellerId("seller-id")).thenReturn(orderItemHistory);

        ResponseEntity<OrderItemHistory> responseEntity = orderController.getSellerOrderItems(authentication);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals(orderItemHistory, responseEntity.getBody());
    }

    @Test
    void getClientOrdersWhenValidInput_thenReturnOrderHistory() {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("client-id");

        OrderHistory orderHistory = new OrderHistory();
        when(orderService.getOrdersByBuyerId("client-id")).thenReturn(orderHistory);

        ResponseEntity<OrderHistory> responseEntity = orderController.getClientOrders(authentication);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals(orderHistory, responseEntity.getBody());
    }

    @Test
    void redoOrderWhenValidInput_thenReturnListOfItemIds() {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("buyer-id");

        String orderId = "order-id2";
        List<String> itemIds = new ArrayList<>(Arrays.asList("item-id1", "item-id2"));

        when(orderService.redoOrder(orderId, "buyer-id")).thenReturn(itemIds);

        ResponseEntity<List<String>> responseEntity = orderController.redoOrder(authentication, orderId);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals(itemIds, responseEntity.getBody());
    }

    @Test
    void getOrderWhenValidInput_thenReturnOrderResponse() {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("buyer-id");

        String orderId = "order-id3";
        OrderResponse orderResponse = new OrderResponse(); // Mock your OrderResponse as needed
        when(orderService.getOrderByOrderIdAndBuyerId(orderId, "buyer-id")).thenReturn(orderResponse);

        ResponseEntity<OrderResponse> responseEntity = orderController.getOrder(orderId, authentication);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals(orderResponse, responseEntity.getBody());
    }
}
