package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderItemRepositoryCustom;
import com.gritlab.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final OrderItemRepositoryCustom customRepository;

    private final OrderItemService orderItemService;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        OrderItemRepositoryCustom customRepository,
                        OrderItemService orderItemService,
                        KafkaTemplate<String, Object> kafkaTemplate) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.customRepository = customRepository;
        this.orderItemService = orderItemService;
        this.kafkaTemplate = kafkaTemplate;
    }

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
                .toList();
    }

    public List<String> redoOrder(String orderId, String buyerId) {
        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        if (order.getStatusCode() != OrderStatus.CONFIRMED) {
            throw new InvalidParamException("You can only redo order that has been confirmed");
        }

        List<OrderItem> items = orderItemRepository.findByOrderIdAndBuyerId(orderId, buyerId);

        if (items == null || items.isEmpty()) {
            throw new InvalidParamException("You can only redo order with at least one order item");
        }

        List<String> itemIds = new ArrayList<>();

        for (OrderItem orderItem: items) {
            if (orderItem.getStatusCode() == OrderStatus.CONFIRMED) {
                OrderItemRedo data = OrderItemRedo.builder()
                        .itemId(orderItem.getItemId())
                        .orderId(orderItem.getOrderId())
                        .productId(orderItem.getProductId())
                        .quantity(orderItem.getQuantity())
                        .build();

                String itemId = orderItemService.redoOrderItem(buyerId, data);
                itemIds.add(itemId);
            }
        }

        return itemIds;
    }

    public String addOrder(String buyerId, OrderRequest data) {
        if (data.getStatusCode() != OrderStatus.CREATED) {
            throw new InvalidParamException("Order status must be CREATED for order to be created");
        }

        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);

        if (items == null || items.isEmpty()) {
            throw new InvalidParamException("Order can only be created with at least one order item in cart");
        }

        Order order = Order.builder()
                .buyerId(buyerId)
                .statusCode(data.getStatusCode())
                .paymentCode(data.getPaymentCode())
                .build();

        Order newOrder = orderRepository.save(order);

        String orderId = newOrder.getOrderId();

        List<OrderItem> newItems = new ArrayList<>();

        for (OrderItem orderItem: items) {
            orderItem.setOrderId(orderId);
            OrderItem newItem = orderItemRepository.save(orderItem);
            newItems.add(newItem);
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

        assert order != null;
        List<OrderItem> items = order.getItems();
        List<OrderItem> newItems = new ArrayList<>();

        for (OrderItem orderItem: items) {
            if (orderItem.getProductId() == null) {
                orderItemRepository.delete(orderItem);
            } else {
                orderItemRepository.save(orderItem);
                newItems.add(orderItem);
            }
        }

        order.setItems(newItems);

        if (order.getItems() == null || order.getItems().isEmpty()) {
            orderRepository.delete(order);
        } else {
            orderRepository.save(order);
        }
    }

    public Order convertFromJsonToOrder(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, Order.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from json to order : {}", e.getMessage());
            return null;
        }
    }

    public String convertFromOrderToJson(Order order) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(order);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from order to json : {}", e.getMessage());
            return null;
        }
    }

    public void updateOrder(String orderId, String buyerId, OrderRequest data) {
        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        if (order.getStatusCode() == OrderStatus.CREATED && data.getStatusCode() == OrderStatus.CANCELLED) {

            List<OrderItem> items = order.getItems();

            for (OrderItem orderItem: items) {
                if (orderItem.getStatusCode() == OrderStatus.CREATED || orderItem.getStatusCode() == OrderStatus.CONFIRMED) {

                    // Serialize newItem to JSON
                    String jsonMessage = orderItemService.convertFromOrderItemToJson(orderItem);
                    kafkaTemplate.send("UPDATE_PRODUCT_QUANTITY", jsonMessage);
                }

                orderItem.setStatusCode(OrderStatus.CANCELLED);
                orderItemRepository.save(orderItem);
            }

            order.setItems(items);

            order.setStatusCode(data.getStatusCode());
            orderRepository.save(order);
        } else {
            throw new InvalidParamException(order.getStatusCode().toString());
        }
    }

    public void deleteOrder(String orderId, String buyerId) {
        Order order = orderRepository.findByOrderIdAndBuyerId(orderId, buyerId).orElseThrow();

        if (order.getStatusCode() != OrderStatus.CANCELLED) {
            throw new InvalidParamException("Order status must be CANCELLED for order to be deleted");
        }

        List<OrderItem> items = order.getItems();

        for (OrderItem orderItem: items) {
            orderItem.setOrderId("<removed>");
            orderItemRepository.save(orderItem);
        }

        orderRepository.delete(order);
    }
}
