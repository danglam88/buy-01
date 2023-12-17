package com.gritlab.unit;

import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderItemRepositoryCustom;
import com.gritlab.repository.OrderRepository;
import com.gritlab.service.OrderItemService;
import com.gritlab.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderItemRepositoryCustom customRepository;

    @Mock
    private OrderItemService orderItemService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void getOrdersByBuyerId_WhenValidBuyerId_thenReturnOrderHistory() {
        String buyerId = "valid-buyer-id";
        List<Order> mockOrders = Collections.singletonList(new Order());
        when(orderRepository.findByBuyerId(buyerId)).thenReturn(mockOrders);
        when(orderItemRepository.findByOrderId(anyString())).thenReturn(Collections.singletonList(new OrderItem()));
        when(customRepository.sumQuantityByProductIdAndBuyerId(buyerId)).thenReturn(Collections.emptyList());
        when(customRepository.getTotalSumItemPriceByBuyerId(buyerId)).thenReturn(100.0);

        OrderHistory result = orderService.getOrdersByBuyerId(buyerId);

        assertNotNull(result);
        assertFalse(result.getOrders().isEmpty());
    }

    @Test
    void getOrdersByBuyerId_WhenInvalidBuyerId_thenReturnEmptyHistory() {
        String buyerId = "invalid-buyer-id";
        when(orderRepository.findByBuyerId(buyerId)).thenReturn(Collections.emptyList());

        OrderHistory result = orderService.getOrdersByBuyerId(buyerId);

        assertNotNull(result);
        assertTrue(result.getOrders().isEmpty());
    }

    @Test
    void getOrderByOrderIdAndBuyerId_WhenValidInputs_thenReturnOrderResponse() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";

        Order mockOrder = new Order();
        mockOrder.setOrderId(orderId);
        mockOrder.setBuyerId(buyerId);
        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(Collections.singletonList(new OrderItem()));

        OrderResponse result = orderService.getOrderByOrderIdAndBuyerId(orderId, buyerId);

        assertNotNull(result);
        assertEquals(orderId, result.getOrderId());
    }

    @Test
    void getOrderByOrderIdAndBuyerId_WhenInvalidInputs_thenThrowException() {
        String orderId = "invalid-order-id";
        String buyerId = "invalid-buyer-id";

        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrderByOrderIdAndBuyerId(orderId, buyerId));
    }

    @Test
    void getOrderItemsBySellerId_WhenValidSellerId_thenReturnOrderItemHistory() {
        String sellerId = "valid-seller-id";
        List<OrderItem> mockOrderItems = Arrays.asList(new OrderItem(), new OrderItem());
        when(orderItemRepository.findBySellerIdAndOrderIdIsNotNull(sellerId)).thenReturn(mockOrderItems);
        when(customRepository.sumQuantityByProductIdAndSellerId(sellerId)).thenReturn(Collections.emptyList());
        when(customRepository.getTotalSumItemPriceBySellerId(sellerId)).thenReturn(100.0);

        OrderItemHistory result = orderService.getOrderItemsBySellerId(sellerId);

        assertNotNull(result);
        assertFalse(result.getItems().isEmpty());
    }

    @Test
    void getOrderItemsBySellerId_WhenInvalidSellerId_thenReturnEmptyOrderItemHistory() {
        String sellerId = "invalid-seller-id";
        when(orderItemRepository.findBySellerIdAndOrderIdIsNotNull(sellerId)).thenReturn(Collections.emptyList());

        OrderItemHistory result = orderService.getOrderItemsBySellerId(sellerId);

        assertNotNull(result);
        assertTrue(result.getItems().isEmpty());
    }

    @Test
    void addOrder_WhenValidData_thenSuccess() {
        String buyerId = "valid-buyer-id";
        OrderRequest data = new OrderRequest();
        data.setStatusCode(OrderStatus.CREATED);
        data.setPaymentCode(Payment.CASH);

        // Mock OrderItem
        OrderItem item1 = new OrderItem();
        item1.setStatusCode(OrderStatus.CONFIRMED);

        when(orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId)).thenReturn(Collections.singletonList(item1));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setOrderId("generated-order-id"); // Simulate orderId generation
            return order;
        });

        String orderId = orderService.addOrder(buyerId, data);

        assertNotNull(orderId);
        verify(kafkaTemplate).send(eq("CREATE_ORDER_REQUEST"), anyString());
        verify(orderItemRepository).save(any(OrderItem.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void addOrder_WhenInvalidData_thenThrowException() {
        String buyerId = "valid-buyer-id";
        OrderRequest data = new OrderRequest();
        data.setStatusCode(OrderStatus.CONFIRMED);

        assertThrows(InvalidParamException.class, () -> orderService.addOrder(buyerId, data));
    }

    @Test
    void redoOrder_WhenValidOrder_thenSuccess() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";

        Order mockOrder = new Order();
        mockOrder.setOrderId(orderId);
        mockOrder.setStatusCode(OrderStatus.CONFIRMED);
        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));

        // Mock OrderItem
        OrderItem item1 = new OrderItem();
        item1.setStatusCode(OrderStatus.CONFIRMED);

        List<OrderItem> mockOrderItems = Collections.singletonList(item1);
        when(orderItemRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(mockOrderItems);

        when(orderItemService.redoOrderItem(anyString(), any(OrderItemRedo.class))).thenReturn("new-item-id");

        List<String> result = orderService.redoOrder(orderId, buyerId);

        assertFalse(result.isEmpty());
        assertEquals("new-item-id", result.get(0));
    }

    @Test
    void redoOrder_WhenInvalidOrder_thenThrowException() {
        String orderId = "invalid-order-id";
        String buyerId = "invalid-buyer-id";

        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.redoOrder(orderId, buyerId));
    }

    @Test
    void updateOrder_WhenValidInputs_thenUpdateSuccessfully() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";

        OrderRequest data = new OrderRequest();
        data.setStatusCode(OrderStatus.CANCELLED);
        data.setPaymentCode(Payment.CASH);

        Order mockOrder = new Order();
        mockOrder.setStatusCode(OrderStatus.CREATED);

        // Mock OrderItems
        OrderItem item1 = new OrderItem();
        item1.setStatusCode(OrderStatus.CONFIRMED);
        OrderItem item2 = new OrderItem();
        item2.setStatusCode(OrderStatus.CREATED);

        mockOrder.setItems(Arrays.asList(item1, item2));

        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderItemService.convertFromOrderItemToJson(any(OrderItem.class))).thenReturn("mock-json");

        orderService.updateOrder(orderId, buyerId, data);

        verify(kafkaTemplate).send(eq("UPDATE_PRODUCT_QUANTITY"), anyString());
        verify(orderItemRepository, times(mockOrder.getItems().size())).save(any(OrderItem.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void updateOrder_WhenInvalidState_thenThrowException() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";
        OrderRequest data = new OrderRequest();
        data.setStatusCode(OrderStatus.CONFIRMED); // Status not CANCELLED

        Order mockOrder = new Order();
        mockOrder.setStatusCode(OrderStatus.CREATED);
        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));

        assertThrows(InvalidParamException.class, () -> orderService.updateOrder(orderId, buyerId, data));
    }

    @Test
    void deleteOrder_WhenOrderCanBeDeleted_thenSuccess() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";

        Order mockOrder = new Order();
        mockOrder.setStatusCode(OrderStatus.CANCELLED);

        // Mock OrderItems
        OrderItem item1 = new OrderItem();
        item1.setStatusCode(OrderStatus.CANCELLED);
        OrderItem item2 = new OrderItem();
        item2.setStatusCode(OrderStatus.CANCELLED);

        mockOrder.setItems(Arrays.asList(item1, item2));
        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));

        orderService.deleteOrder(orderId, buyerId);

        verify(orderItemRepository, times(mockOrder.getItems().size())).save(any(OrderItem.class));
        verify(orderRepository).delete(mockOrder);
    }

    @Test
    void deleteOrder_WhenOrderCannotBeDeleted_thenThrowException() {
        String orderId = "valid-order-id";
        String buyerId = "valid-buyer-id";

        Order mockOrder = new Order();
        mockOrder.setStatusCode(OrderStatus.CONFIRMED); // Status not CANCELLED
        when(orderRepository.findByOrderIdAndBuyerId(orderId, buyerId)).thenReturn(Optional.of(mockOrder));

        assertThrows(InvalidParamException.class, () -> orderService.deleteOrder(orderId, buyerId));
    }
}
