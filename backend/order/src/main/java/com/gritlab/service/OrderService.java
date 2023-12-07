package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderItemRepositoryCustom;
import com.gritlab.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    OrderItemRepositoryCustom customRepository;

    @Autowired
    private OrderItemService orderItemService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public OrderHistory getOrdersByBuyerId(String buyerId) {

        OrderHistory history = new OrderHistory();
        List<OrderResponse> ordersFullData = new ArrayList<>();
        List<Order> orders = orderRepository.findByBuyerId(buyerId);

        for (Order order: orders) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());

            OrderResponse fullOrderData = OrderResponse.builder()
                    .orderId(order.getOrderId())
                    .statusCode(order.getStatusCode())
                    .items(convertToDTO(items))
                    .paymentCode(order.getPaymentCode())
                    .build();

            ordersFullData.add(fullOrderData);
        }

        history.setOrders(ordersFullData);
        history.setTopProducts(customRepository.sumQuantityByProductIdAndBuyerId(buyerId));
        history.setTotalAmount(customRepository.getTotalSumItemPriceByBuyerId(buyerId));

        return history;
    }

    public OrderResponse getOrderByOrderIdAndBuyerId(String orderId, String buyerId) {

        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .statusCode(order.getStatusCode())
                .items(convertToDTO(items))
                .paymentCode(order.getPaymentCode())
                .build();
    }

    public OrderItemHistory getOrderItemsBySellerId(String sellerId) {

        OrderItemHistory history = new OrderItemHistory();
        List<OrderItem> items = orderItemRepository.findBySellerIdAndOrderIdIsNotNull(sellerId);

        List<OrderItemResponse> itemsFullData = convertToDTO(items);

        history.setItems(itemsFullData);
        history.setTopProducts(customRepository.sumQuantityByProductIdAndSellerId(sellerId));
        history.setTotalAmount(customRepository.getTotalSumItemPriceBySellerId(sellerId));

        return history;
    }

    public List<OrderItemResponse> convertToDTO(List<OrderItem> orderItems) {

        return orderItems.stream()
                .map(OrderItemResponse::fromOrderItem)
                .collect(Collectors.toList());
    }

    public String addOrder(String buyerId, OrderRequest data) {
        if (data.getStatusCode() != OrderStatus.CREATED) {
            throw new IllegalArgumentException("Order status must be CREATED for order to be created");
        }

        if (data.getPaymentCode() != Payment.CASH) {
            throw new IllegalArgumentException("Payment method not supported. Only CASH is supported for now");
        }

        Order order = Order.builder()
                .buyerId(buyerId)
                .statusCode(data.getStatusCode())
                .paymentCode(data.getPaymentCode())
                .build();

        Order newOrder = orderRepository.save(order);

        String orderId = newOrder.getOrderId();

        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);
        List<OrderItem> newItems = new ArrayList<>();
        List<String> sellerIds = new ArrayList<>();

        for (OrderItem orderItem: items) {
            orderItem.setOrderId(orderId);
            OrderItem newItem = orderItemRepository.save(orderItem);
            newItems.add(newItem);
            sellerIds.add(newItem.getSellerId());
        }

        newOrder.setItems(newItems);

        // Serialize newOrder to JSON
        String jsonMessage = convertFromOrderToJson(newOrder);

        kafkaTemplate.send("CREATE_ORDER_REQUEST", jsonMessage);

        return orderId;
    }

    @KafkaListener(topics = "CREATE_ORDER_RESPONSE", groupId = "my-consumer-group")
    public void createOrderResponse(String message) {
        // Deserialize JSON to Order
        Order order = convertFromJsonToOrder(message);

        List<OrderItem> items = order.getItems();

        for (OrderItem orderItem: items) {
            if (orderItem.getProductId() == null) {
                orderItem.setStatusCode(OrderStatus.CANCELLED);
            }
            orderItemRepository.save(orderItem);
        }

        order.setItems(items);

        if (orderItemService.allItemsHaveStatus(order.getItems(), OrderStatus.CANCELLED)) {
            order.setStatusCode(OrderStatus.CANCELLED);
        }

        orderRepository.save(order);
    }

    private Order convertFromJsonToOrder(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, Order.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String convertFromOrderToJson(Order order) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(order);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public void updateOrder(String orderId, String buyerId, OrderRequest data) {
        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        if (order.getStatusCode() == OrderStatus.CREATED
                && (data.getStatusCode() == OrderStatus.CANCELLED
                || (data.getStatusCode() == OrderStatus.CONFIRMED
                && orderItemService.atLeastOneItemHasRequiredStatus(order.getItems(),
                OrderStatus.CONFIRMED, OrderStatus.CANCELLED)))) {

            order.setStatusCode(data.getStatusCode());
            orderRepository.save(order);
        } else {
            throw new IllegalArgumentException("You can only CANCEL a CREATED order or CONFIRM a CREATED order with all order items CONFIRMED");
        }
    }

    public void deleteOrder(String orderId, String buyerId) {
        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        if (order.getStatusCode() != OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order status must be CANCELLED for order to be deleted");
        }

        List<OrderItem> items = order.getItems();

        for (OrderItem orderItem: items) {
            orderItemService.deleteOrderItem(orderItem.getItemId(), buyerId);
        }

        orderRepository.delete(order);
    }
}
