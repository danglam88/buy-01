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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class OrderControllerTest {

    private OrderController orderController;

    @Mock
    private OrderService orderService;

    @Mock
    private Authentication authentication;

    @Autowired
    private UriComponentsBuilder ucb;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        orderController = new OrderController(orderService);
        ucb = UriComponentsBuilder.newInstance();
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
}
