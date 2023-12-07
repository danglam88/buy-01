package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private OrderRepository orderRepository;

    public List<CartItemResponse> getOrderItems(String buyerId) {
        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);
        List<CartItemResponse> responseItems = new ArrayList<>();

        for (OrderItem item : items) {

             ProductDTO product = new ProductDTO(item.getProductId(),
                     item.getName(), item.getDescription(),
                     item.getItemPrice(), item.getMaxQuantity(), item.getSellerId());
             CartItemResponse responseItem = CartItemResponse.builder()
                     .itemId(item.getItemId())
                     .quantity(item.getQuantity())
                     .itemPrice(item.getItemPrice() * item.getQuantity())
                     .product(product).build();

            responseItems.add(responseItem);
        }

        return responseItems;
    }

    public String addOrderItem(String buyerId, OrderItemDTO data) {
        if (data.getQuantity() != 1) {
            throw new IllegalArgumentException("Quantity must be 1 for order item to be initially added");
        }

        Optional<OrderItem> itemOptional =
                orderItemRepository.findByProductIdAndOrderIdIsNull(data.getProductId());

        if (itemOptional.isEmpty()) {
            OrderItem item = OrderItem.builder()
                    .productId(data.getProductId())
                    .quantity(data.getQuantity())
                    .buyerId(buyerId)
                    .statusCode(OrderStatus.CREATED)
                    .build();

            OrderItem newItem = orderItemRepository.save(item);

            // Serialize newItem to JSON
            String jsonMessage = convertFromOrderItemToJson(newItem);

            kafkaTemplate.send("CREATE_CART_REQUEST", jsonMessage);

            return newItem.getItemId();
        }

        return itemOptional.get().getItemId();
    }

    private OrderItem convertFromJsonToOrderItem(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, OrderItem.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    private String convertFromOrderItemToJson(OrderItem item) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(item);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @KafkaListener(topics = "CREATE_CART_RESPONSE", groupId = "my-consumer-group")
    public void createCartResponse(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        if (orderItem.getProductId() == null) {
            orderItemRepository.delete(orderItem);
            throw new IllegalArgumentException("Product " + orderItem.getName() + " is not available");
        } else {
            orderItemRepository.save(orderItem);
        }
    }

    @KafkaListener(topics = "UPDATE_CART_RESPONSE", groupId = "my-consumer-group")
    public void updateCartResponse(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        if (orderItem.getProductId() == null) {
            orderItemRepository.delete(orderItem);
            throw new IllegalArgumentException("Product " + orderItem.getName() + " is not available anymore");
        } else {
            orderItemRepository.save(orderItem);
        }
    }

    @KafkaListener(topics = "UPDATE_STATUS_RESPONSE", groupId = "my-consumer-group")
    public void updateStatusResponse(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        if (orderItem.getStatusCode() == OrderStatus.CANCELLED || orderItem.getStatusCode() == OrderStatus.CONFIRMED) {
            orderItemRepository.save(orderItem);
        }

        Order order = orderRepository.findByOrderId(orderItem.getOrderId()).orElseThrow();

        List<OrderItem> items = order.getItems();

        for (OrderItem item: items) {
            if (item.getItemId().equals(orderItem.getItemId())
                    && (orderItem.getStatusCode() == OrderStatus.CANCELLED
                    || orderItem.getStatusCode() == OrderStatus.CONFIRMED)) {
                item.setStatusCode(orderItem.getStatusCode());
                break;
            }
        }

        order.setItems(items);

        if (allItemsHaveStatus(order.getItems(), OrderStatus.CANCELLED)) {
            order.setStatusCode(OrderStatus.CANCELLED);
        } else if (atLeastOneItemHasRequiredStatus(order.getItems(), OrderStatus.CONFIRMED, OrderStatus.CANCELLED)) {
            order.setStatusCode(OrderStatus.CONFIRMED);
        }

        orderRepository.save(order);
    }

    public boolean atLeastOneItemHasRequiredStatus(List<OrderItem> items, OrderStatus requiredStatus, OrderStatus allowedStatus) {
        boolean atLeastOneItemHasRequiredStatus = false;
        boolean allItemsHaveValidStatus = true;

        for (OrderItem item: items) {
            if (item.getStatusCode() == requiredStatus) {
                atLeastOneItemHasRequiredStatus = true;
            } else if (item.getStatusCode() != allowedStatus) {
                allItemsHaveValidStatus = false;
                break;
            }
        }

        return atLeastOneItemHasRequiredStatus && allItemsHaveValidStatus;
    }

    public boolean allItemsHaveStatus(List<OrderItem> items, OrderStatus status) {
        for (OrderItem item: items) {
            if (item.getStatusCode() != status) {
                return false;
            }
        }
        return true;
    }

    public void updateOrderItem(String itemId, String buyerId, OrderItemDTO data) {
        Optional<OrderItem> itemOptional = orderItemRepository
                .findByItemIdAndBuyerIdAndProductIdAndOrderIdIsNull(itemId,
                        buyerId, data.getProductId());

        if (itemOptional.isPresent()) {
            OrderItem updatedItem = OrderItem.builder()
                    .itemId(itemId)
                    .productId(data.getProductId())
                    .statusCode(OrderStatus.CREATED)
                    .quantity(data.getQuantity())
                    .buyerId(buyerId)
                    .build();

            // Serialize newItem to JSON
            String jsonMessage = convertFromOrderItemToJson(updatedItem);

            kafkaTemplate.send("UPDATE_CART_REQUEST", jsonMessage);
        } else {
            throw new IllegalArgumentException("You can only update quantity of order item that is in your own cart");
        }
    }

    public void updateOrderItemStatus(String itemId, String sellerId, OrderItemStatusDTO data) {
        if (data.getStatusCode() == OrderStatus.CREATED) {
            throw new IllegalArgumentException("You can only set status of order item to CONFIRMED or CANCELLED");
        }

        Optional<OrderItem> itemOptional = orderItemRepository
                .findByItemIdAndSellerIdAndProductIdAndOrderId(itemId,
                        sellerId, data.getProductId(), data.getOrderId());

        if (itemOptional.isPresent()) {

            if (itemOptional.get().getStatusCode() != OrderStatus.CREATED) {
                throw new IllegalArgumentException("You can only update status of order item with current status as CREATED");
            }

            OrderItem updatedItem = OrderItem.builder()
                    .itemId(itemId)
                    .productId(data.getProductId())
                    .statusCode(data.getStatusCode())
                    .orderId(data.getOrderId())
                    .quantity(itemOptional.get().getQuantity())
                    .buyerId(itemOptional.get().getBuyerId())
                    .sellerId(sellerId)
                    .build();

            // Serialize newItem to JSON
            String jsonMessage = convertFromOrderItemToJson(updatedItem);

            kafkaTemplate.send("UPDATE_STATUS_REQUEST", jsonMessage);
        } else {
            throw new IllegalArgumentException("You can only update status of order item that has your own product");
        }
    }

    public void deleteOrderItem(String itemId, String buyerId) {
        OrderItem item = orderItemRepository
                .findByItemIdAndBuyerId(itemId, buyerId).orElseThrow();

        if (item.getOrderId() == null) {
            orderItemRepository.delete(item);

        } else if (item.getStatusCode() == OrderStatus.CANCELLED) {
            orderItemRepository.delete(item);

            Order order = orderRepository.findByOrderIdAndBuyerId(item.getOrderId(), buyerId).orElseThrow();

            List<OrderItem> items = order.getItems();
            items.remove(item);

            order.setItems(items);
            orderRepository.save(order);
        } else {
            throw new IllegalArgumentException("You can only delete order item that is in your own cart or has been cancelled by seller");
        }
    }
}
