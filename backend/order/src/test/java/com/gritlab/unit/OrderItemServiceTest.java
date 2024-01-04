package com.gritlab.unit;

import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.service.OrderItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderItemServiceTest {

    @InjectMocks
    private OrderItemService orderItemService;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void getOrderItems_WhenValidBuyerId_thenReturnListOfCartItemResponse() {
        String buyerId = "valid-buyer-id";
        String itemId = "valid-item-id";

        // Mock OrderItem
        OrderItem item1 = new OrderItem();
        item1.setItemId(itemId);
        item1.setBuyerId(buyerId);
        item1.setItemPrice(100.0); // Set item price
        item1.setQuantity(2); // Set quantity

        List<OrderItem> mockOrderItems = Collections.singletonList(item1);
        when(orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId)).thenReturn(mockOrderItems);

        when(orderItemRepository.findByItemIdAndBuyerIdAndOrderIdIsNull(itemId, buyerId))
                .thenReturn(Optional.of(item1));

        List<CartItemResponse> result = orderItemService.getOrderItems(buyerId);

        assertFalse(result.isEmpty());
    }

    @Test
    void getOrderItems_WhenNoItemsFound_thenReturnEmptyList() {
        String buyerId = "buyer-id-with-no-items";
        when(orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId)).thenReturn(Collections.emptyList());
        List<CartItemResponse> result = orderItemService.getOrderItems(buyerId);
        assertTrue(result.isEmpty());
    }

    @Test
    void getOrderItemByItemIdAndBuyerId_WhenValidInputs_thenReturnCartItemResponse() {
        String itemId = "valid-item-id";
        String buyerId = "valid-buyer-id";

        OrderItem mockItem = new OrderItem();
        mockItem.setItemId(itemId);
        mockItem.setBuyerId(buyerId);
        mockItem.setItemPrice(100.0); // Set item price
        mockItem.setQuantity(2); // Set quantity

        when(orderItemRepository.findByItemIdAndBuyerIdAndOrderIdIsNull(itemId, buyerId))
                .thenReturn(Optional.of(mockItem));

        CartItemResponse result = orderItemService.getOrderItemByItemIdAndBuyerId(itemId, buyerId);

        assertNotNull(result);
        assertEquals(itemId, result.getItemId());
    }

    @Test
    void getOrderItemByItemIdAndBuyerId_WhenInvalidInputs_thenThrowException() {
        String itemId = "invalid-item-id";
        String buyerId = "invalid-buyer-id";

        when(orderItemRepository.findByItemIdAndBuyerIdAndOrderIdIsNull(itemId, buyerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderItemService.getOrderItemByItemIdAndBuyerId(itemId, buyerId));
    }

    @Test
    void addOrderItem_WhenValidData_thenSuccess() {
        String buyerId = "valid-buyer-id";
        OrderItemDTO data = new OrderItemDTO();
        data.setQuantity(1);
        data.setProductId("product-id");

        when(orderItemRepository.findByBuyerIdAndProductIdAndOrderIdIsNull(buyerId, data.getProductId())).thenReturn(Optional.empty());
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderItemService.addOrderItem(buyerId, data));
        verify(kafkaTemplate).send(eq("CREATE_CART_REQUEST"), anyString());
        verify(orderItemRepository).save(any(OrderItem.class));
    }

    @Test
    void addOrderItem_WhenQuantityNotOne_thenThrowInvalidParamException() {
        String buyerId = "buyer-id";
        OrderItemDTO data = new OrderItemDTO();
        data.setQuantity(2); // Quantity not one

        InvalidParamException thrown = assertThrows(
                InvalidParamException.class,
                () -> orderItemService.addOrderItem(buyerId, data),
                "Expected addOrderItem to throw, but it didn't"
        );

        assertTrue(thrown.getMessage().contains("Quantity must be 1 for order item to be initially added"));
    }

    @Test
    void addOrderItem_WhenItemAlreadyExists_thenUpdateQuantity() {
        String buyerId = "buyer-id";
        String existingProductId = "existing-product-id";
        OrderItemDTO data = new OrderItemDTO();
        data.setQuantity(1);
        data.setProductId(existingProductId);

        OrderItem existingItem = new OrderItem();
        existingItem.setProductId(existingProductId);
        existingItem.setQuantity(1);
        existingItem.setItemId("existing-item-id");

        when(orderItemRepository.findByBuyerIdAndProductIdAndOrderIdIsNull(buyerId, existingProductId))
                .thenReturn(Optional.of(existingItem));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String result = orderItemService.addOrderItem(buyerId, data);

        assertNotNull(result, "Result should not be null");
        assertEquals("existing-item-id", result, "Item ID should match the existing item");
        verify(kafkaTemplate).send(eq("CREATE_CART_REQUEST"), anyString());
    }

    @Test
    void redoOrderItem_WhenOrderItemConfirmed_thenSuccess() {
        String buyerId = "buyer-id";
        String productId = "product-id";
        String orderId = "order-id";
        String itemId = "item-id";
        int quantity = 2;

        // Creating a redo order item
        OrderItemRedo data = new OrderItemRedo();
        data.setItemId(itemId);
        data.setProductId(productId);
        data.setOrderId(orderId);
        data.setQuantity(quantity);

        // Mocking an existing confirmed order item
        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CONFIRMED);

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId, buyerId, productId, orderId))
                .thenReturn(Optional.of(mockItem));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderItemService.redoOrderItem(buyerId, data));
        verify(kafkaTemplate).send(eq("CREATE_CART_REQUEST"), anyString());
        verify(orderItemRepository).save(any(OrderItem.class));
    }

    @Test
    void redoOrderItem_WhenOrderItemNotConfirmed_thenThrowInvalidParamException() {
        String buyerId = "buyer-id";
        OrderItemRedo data = new OrderItemRedo();
        data.setItemId("item-id");
        data.setProductId("product-id");
        data.setOrderId("order-id");

        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CREATED); // Status is not CONFIRMED

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Optional.of(mockItem));

        InvalidParamException thrown = assertThrows(
                InvalidParamException.class,
                () -> orderItemService.redoOrderItem(buyerId, data),
                "Expected redoOrderItem to throw, but it didn't"
        );

        assertTrue(thrown.getMessage().contains("You can only redo order item that has been confirmed by a seller"));
    }

    @Test
    void updateOrderItem_WhenValidInputs_thenUpdateSuccessfully() {
        String itemId = "valid-item-id";
        String buyerId = "valid-buyer-id";
        OrderItemDTO data = new OrderItemDTO();

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderIdIsNull(itemId, buyerId, data.getProductId()))
                .thenReturn(Optional.of(new OrderItem()));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderItemService.updateOrderItem(itemId, buyerId, data));
        verify(kafkaTemplate).send(eq("CREATE_CART_REQUEST"), anyString());
    }

    @Test
    void updateOrderItem_WhenItemNotFound_thenThrowRuntimeException() {
        String itemId = "invalid-item-id";
        String buyerId = "buyer-id";
        OrderItemDTO data = new OrderItemDTO();

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderIdIsNull(itemId, buyerId, data.getProductId()))
                .thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> orderItemService.updateOrderItem(itemId, buyerId, data));
    }

    @Test
    void updateOrderItemStatus_WhenValidInputs_thenUpdateSuccessfully() {
        String itemId = "valid-item-id";
        String sellerId = "valid-seller-id";
        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CONFIRMED);
        data.setProductId("product-id");
        data.setOrderId("order-id");

        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CREATED);
        when(orderItemRepository.findByItemIdAndSellerIdAndProductIdAndOrderId(itemId, sellerId, data.getProductId(), data.getOrderId()))
                .thenReturn(Optional.of(mockItem));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderItemService.updateOrderItemStatus(itemId, sellerId, data));
        verify(kafkaTemplate).send(eq("UPDATE_STATUS_REQUEST"), anyString());
    }

    @Test
    void updateOrderItemStatus_WhenInvalidStatus_thenThrowInvalidParamException() {
        String itemId = "item-id";
        String sellerId = "seller-id";
        String productId = "product-id";
        String orderId = "order-id";

        // Creating a status update DTO with an invalid status
        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CREATED); // Invalid status for this operation
        data.setProductId(productId);
        data.setOrderId(orderId);

        // Mocking an existing order item
        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CREATED);

        when(orderItemRepository.findByItemIdAndSellerIdAndProductIdAndOrderId(itemId, sellerId, productId, orderId))
                .thenReturn(Optional.of(mockItem));

        InvalidParamException thrown = assertThrows(
                InvalidParamException.class,
                () -> orderItemService.updateOrderItemStatus(itemId, sellerId, data),
                "Expected updateOrderItemStatus to throw, but it didn't"
        );

        assertTrue(thrown.getMessage().contains("You can only set status of order item to CONFIRMED or CANCELLED"));
    }

    @Test
    void cancelOrderItem_WhenValidInputs_thenCancelSuccessfully() {
        String itemId = "valid-item-id";
        String buyerId = "valid-buyer-id";
        String productId = "product-id";
        String orderId = "order-id";

        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CANCELLED);
        data.setProductId(productId);
        data.setOrderId(orderId);

        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CREATED);

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId, buyerId, productId, orderId))
                .thenReturn(Optional.of(mockItem));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> orderItemService.cancelOrderItem(itemId, buyerId, data));
        verify(kafkaTemplate).send(eq("UPDATE_STATUS_REQUEST"), anyString());
    }

    @Test
    void cancelOrderItem_WhenInvalidStatus_thenThrowInvalidParamException() {
        String itemId = "item-id";
        String buyerId = "buyer-id";
        String productId = "product-id";
        String orderId = "order-id";

        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CONFIRMED); // Invalid status for cancel
        data.setProductId(productId);
        data.setOrderId(orderId);

        OrderItem mockItem = new OrderItem();

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId, buyerId, productId, orderId))
                .thenReturn(Optional.of(mockItem));

        InvalidParamException thrown = assertThrows(
                InvalidParamException.class,
                () -> orderItemService.cancelOrderItem(itemId, buyerId, data),
                "Expected cancelOrderItem to throw, but it didn't"
        );

        assertTrue(thrown.getMessage().contains("You can only set status of your order item to CANCELLED"));
    }

    @Test
    void cancelOrderItem_WhenOrderItemNotFound_thenThrowRuntimeException() {
        String itemId = "non-existent-item-id";
        String buyerId = "buyer-id";
        String productId = "product-id";
        String orderId = "order-id";

        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CANCELLED);
        data.setProductId(productId);
        data.setOrderId(orderId);

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId, buyerId, productId, orderId))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderItemService.cancelOrderItem(itemId, buyerId, data));
    }

    @Test
    void cancelOrderItem_WhenInvalidOrderItemStatus_thenThrowInvalidParamException() {
        String itemId = "item-id";
        String buyerId = "buyer-id";
        String productId = "product-id";
        String orderId = "order-id";

        OrderItemStatusDTO data = new OrderItemStatusDTO();
        data.setStatusCode(OrderStatus.CANCELLED);
        data.setProductId(productId);
        data.setOrderId(orderId);

        OrderItem mockItem = new OrderItem();
        mockItem.setStatusCode(OrderStatus.CONFIRMED); // Status is not CREATED

        when(orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId, buyerId, productId, orderId))
                .thenReturn(Optional.of(mockItem));

        InvalidParamException thrown = assertThrows(
                InvalidParamException.class,
                () -> orderItemService.cancelOrderItem(itemId, buyerId, data),
                "Expected cancelOrderItem to throw, but it didn't"
        );

        assertTrue(thrown.getMessage().contains(mockItem.getStatusCode().toString()));
    }

    @Test
    void deleteOrderItem_WhenValidInputs_thenDeleteSuccessfully() {
        String itemId = "valid-item-id";
        String buyerId = "valid-buyer-id";

        // Mocking an existing order item
        OrderItem mockItem = new OrderItem();

        when(orderItemRepository.findByItemIdAndBuyerIdAndOrderIdIsNull(itemId, buyerId))
                .thenReturn(Optional.of(mockItem));

        assertDoesNotThrow(() -> orderItemService.deleteOrderItem(itemId, buyerId));
    }

    @Test
    void deleteOrderItem_WhenOrderItemNotFound_thenThrowRuntimeException() {
        String itemId = "invalid-item-id";
        String buyerId = "buyer-id";

        when(orderItemRepository.findByItemIdAndBuyerIdAndOrderIdIsNull(itemId, buyerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderItemService.deleteOrderItem(itemId, buyerId));
    }
}
