package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.OrderItemRepository;
import com.gritlab.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderItemService {

    private static final String CREATE_CART_REQUEST = "CREATE_CART_REQUEST";

    private static final Logger log = LoggerFactory.getLogger(OrderItemService.class);

    private final OrderItemRepository orderItemRepository;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private final OrderRepository orderRepository;

    @Autowired
    public OrderItemService(OrderItemRepository orderItemRepository,
                            KafkaTemplate<String, Object> kafkaTemplate,
                            OrderRepository orderRepository) {

        this.orderItemRepository = orderItemRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.orderRepository = orderRepository;
    }

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

    public OrderItem convertFromJsonToOrderItem(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, OrderItem.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from json to order item : {}", e.getMessage());
            return null;
        }
    }

    public String convertFromOrderItemToJson(OrderItem item) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(item);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from order item to json : {}", e.getMessage());
            return null;
        }
    }

    @KafkaListener(topics = "CREATE_CART_RESPONSE", groupId = "my-consumer-group")
    public void createCartResponse(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        if (orderItem.getProductId() == null) {
            orderItemRepository.delete(orderItem);
            //throw new InvalidParamException("Order item cannot be created since the chosen product is not available");
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

    public String addOrderItem(String buyerId, OrderItemDTO data) {
        if (data.getQuantity() != 1) {
            throw new InvalidParamException("Quantity must be 1 for order item to be initially added");
        }

        Optional<OrderItem> itemOptional =
                orderItemRepository.findByProductIdAndOrderIdIsNull(data.getProductId());

        if (itemOptional.isEmpty()) {
            OrderItem item = OrderItem.builder()
                    .productId(data.getProductId())
                    .buyerId(buyerId)
                    .statusCode(OrderStatus.CREATED)
                    .quantity(data.getQuantity())
                    .build();

            OrderItem newItem = orderItemRepository.save(item);

            // Serialize newItem to JSON
            String jsonMessage = convertFromOrderItemToJson(newItem);

            kafkaTemplate.send(CREATE_CART_REQUEST, jsonMessage);

            return newItem.getItemId();
        }

        OrderItem updatedItem = OrderItem.builder()
                .itemId(itemOptional.get().getItemId())
                .productId(data.getProductId())
                .buyerId(buyerId)
                .statusCode(OrderStatus.CREATED)
                .quantity(data.getQuantity() + itemOptional.get().getQuantity())
                .build();

        // Serialize updatedItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send(CREATE_CART_REQUEST, jsonMessage);

        return itemOptional.get().getItemId();
    }

    public String redoOrderItem(String buyerId, OrderItemRedo data) {
        OrderItem item =
                orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderId(data.getItemId(),
                        buyerId, data.getProductId(), data.getOrderId()).orElseThrow();

        if (item.getStatusCode() != OrderStatus.CONFIRMED) {
            throw new InvalidParamException("You can only redo order item that has been confirmed by a seller");
        }

        Optional<OrderItem> cartItemOptional =
                orderItemRepository.findByBuyerIdAndProductIdAndOrderIdIsNull(buyerId, data.getProductId());

        if (cartItemOptional.isEmpty()) {
            OrderItem redoItem = OrderItem.builder()
                    .productId(data.getProductId())
                    .buyerId(buyerId)
                    .statusCode(OrderStatus.CREATED)
                    .quantity(data.getQuantity())
                    .build();

            OrderItem newItem = orderItemRepository.save(redoItem);

            // Serialize newItem to JSON
            String jsonMessage = convertFromOrderItemToJson(newItem);

            kafkaTemplate.send(CREATE_CART_REQUEST, jsonMessage);

            return newItem.getItemId();
        }

        OrderItem updatedItem = OrderItem.builder()
                .itemId(cartItemOptional.get().getItemId())
                .productId(data.getProductId())
                .buyerId(buyerId)
                .statusCode(OrderStatus.CREATED)
                .quantity(data.getQuantity() + cartItemOptional.get().getQuantity())
                .build();

        // Serialize updatedItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send(CREATE_CART_REQUEST, jsonMessage);

        return cartItemOptional.get().getItemId();
    }

    public void updateOrderItem(String itemId, String buyerId, OrderItemDTO data) {
        orderItemRepository.findByItemIdAndBuyerIdAndProductIdAndOrderIdIsNull(itemId,
                        buyerId, data.getProductId()).orElseThrow();

        OrderItem updatedItem = OrderItem.builder()
                .itemId(itemId)
                .productId(data.getProductId())
                .statusCode(OrderStatus.CREATED)
                .quantity(data.getQuantity())
                .buyerId(buyerId)
                .build();

        // Serialize newItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send(CREATE_CART_REQUEST, jsonMessage);
    }

    public void updateOrderItemStatus(String itemId, String sellerId, OrderItemStatusDTO data) {
        if (data.getStatusCode() != OrderStatus.CONFIRMED && data.getStatusCode() != OrderStatus.CANCELLED) {
            throw new InvalidParamException("You can only set status of order item to CONFIRMED or CANCELLED");
        }

        OrderItem item = orderItemRepository
                .findByItemIdAndSellerIdAndProductIdAndOrderId(itemId,
                        sellerId, data.getProductId(), data.getOrderId()).orElseThrow();

        if (item.getStatusCode() != OrderStatus.CREATED) {
            throw new InvalidParamException("You can only update status of order item with current status as CREATED");
        }

        OrderItem updatedItem = OrderItem.builder()
                .itemId(itemId)
                .productId(data.getProductId())
                .statusCode(data.getStatusCode())
                .orderId(data.getOrderId())
                .quantity(item.getQuantity())
                .buyerId(item.getBuyerId())
                .sellerId(sellerId)
                .build();

        // Serialize updatedItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send("UPDATE_STATUS_REQUEST", jsonMessage);
    }

    public void cancelOrderItem(String itemId, String buyerId, OrderItemStatusDTO data) {
        if (data.getStatusCode() != OrderStatus.CANCELLED) {
            throw new InvalidParamException("You can only set status of your order item to CANCELLED");
        }

        OrderItem item = orderItemRepository
                .findByItemIdAndBuyerIdAndProductIdAndOrderId(itemId,
                        buyerId, data.getProductId(), data.getOrderId()).orElseThrow();

        if (item.getStatusCode() != OrderStatus.CREATED) {
            throw new InvalidParamException("You can only cancel order item with current status as CREATED");
        }

        OrderItem updatedItem = OrderItem.builder()
                .itemId(itemId)
                .productId(data.getProductId())
                .statusCode(data.getStatusCode())
                .orderId(data.getOrderId())
                .quantity(item.getQuantity())
                .sellerId(item.getSellerId())
                .buyerId(buyerId)
                .build();

        // Serialize updatedItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send("UPDATE_STATUS_REQUEST", jsonMessage);
    }

    public void deleteOrderItem(String itemId, String buyerId) {
        OrderItem item = orderItemRepository
                .findByItemIdAndBuyerId(itemId, buyerId).orElseThrow();
        if (item.getOrderId() == null) {
            orderItemRepository.delete(item);
        }
    }
}
