package com.gritlab.unit;

import com.gritlab.controller.OrderItemController;
import com.gritlab.model.*;
import com.gritlab.service.OrderItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OrderItemControllerTest {

    private OrderItemController orderItemController;

    @Mock
    private OrderItemService orderItemService;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        orderItemController = new OrderItemController(orderItemService);
    }

    @Test
    void getOrderItemsWhenAuthenticated_thenReturnListOfCartItemResponse() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        List<CartItemResponse> expectedItems = new ArrayList<>();
        when(orderItemService.getOrderItems("user-id")).thenReturn(expectedItems);

        ResponseEntity<List<CartItemResponse>> response = orderItemController.getOrderItems(authentication);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(expectedItems, response.getBody());
    }

    @Test
    void getOrderItemWhenValidInput_thenReturnCartItemResponse() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        String itemId = "item-id";
        CartItemResponse expectedItem = new CartItemResponse();
        when(orderItemService.getOrderItemByItemIdAndBuyerId(itemId, "user-id")).thenReturn(expectedItem);

        ResponseEntity<CartItemResponse> response = orderItemController.getOrderItem(itemId, authentication);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(expectedItem, response.getBody());
    }

    @Test
    void addOrderItemsWhenValidInput_thenReturnItemId() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        OrderItemDTO data = new OrderItemDTO();
        String expectedItemId = "new-item-id";
        when(orderItemService.addOrderItem("user-id", data)).thenReturn(expectedItemId);

        ResponseEntity<String> response = orderItemController.addOrderItems(authentication, data);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(expectedItemId, response.getBody());
    }

    @Test
    void redoOrderItemsWhenValidInput_thenReturnItemId() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        OrderItemRedo data = new OrderItemRedo();
        String expectedItemId = "redone-item-id";
        when(orderItemService.redoOrderItem("user-id", data)).thenReturn(expectedItemId);

        ResponseEntity<String> response = orderItemController.redoOrderItems(authentication, data);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(expectedItemId, response.getBody());
    }

    @Test
    void updateOrderItemsWhenValidInput_thenSuccess() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        String itemId = "item-id";
        OrderItemDTO data = new OrderItemDTO();

        ResponseEntity<Void> response = orderItemController.updateOrderItems(itemId, authentication, data);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void updateOrderItemsStatusWhenValidInput_thenSuccess() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        String itemId = "item-id";
        OrderItemStatusDTO data = new OrderItemStatusDTO();

        ResponseEntity<Void> response = orderItemController.updateOrderItemsStatus(itemId, authentication, data);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void cancelOrderItemsWhenValidInput_thenSuccess() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        String itemId = "item-id";
        OrderItemStatusDTO data = new OrderItemStatusDTO();

        ResponseEntity<Void> response = orderItemController.cancelOrderItems(itemId, authentication, data);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void deleteOrderItemsWhenValidInput_thenSuccess() {
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id");

        String itemId = "item-id";

        ResponseEntity<Void> response = orderItemController.deleteOrderItems(itemId, authentication);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
    }
}
