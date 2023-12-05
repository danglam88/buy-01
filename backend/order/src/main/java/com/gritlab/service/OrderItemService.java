package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.OrderItem;
import com.gritlab.model.OrderItemDTO;
import com.gritlab.model.CartItemResponse;
import com.gritlab.model.ProductDTO;
import com.gritlab.repository.OrderItemRepository;
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

    public List<CartItemResponse> getOrderItems(String buyerId) {
        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);
        List<CartItemResponse> responseItems = new ArrayList<>();

        for (OrderItem item : items) {

             ProductDTO product = new ProductDTO(item.getProductId(), item.getName(), item.getDescription(), item.getItemPrice(), item.getMaxQuantity(), item.getSellerId());
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
            throw new IllegalArgumentException("Quantity must be 1");
        }

        Optional<OrderItem> itemOptional =
                orderItemRepository.findByProductIdAndOrderIdIsNull(data.getProductId());

        if (itemOptional.isEmpty()) {
            OrderItem item = OrderItem.builder()
                    .productId(data.getProductId())
                    .quantity(data.getQuantity())
                    .buyerId(buyerId)
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

    public void updateOrderItem(String itemId, String buyerId, OrderItemDTO data) {

        OrderItem item = orderItemRepository
                .findByItemIdAndBuyerIdAndProductId(itemId, buyerId, data.getProductId()).orElseThrow();

        OrderItem updatedItem = OrderItem.builder()
                .itemId(itemId)
                .productId(data.getProductId())
                .quantity(data.getQuantity())
                .buyerId(buyerId)
                .build();

        // Serialize newItem to JSON
        String jsonMessage = convertFromOrderItemToJson(updatedItem);

        kafkaTemplate.send("UPDATE_CART_REQUEST", jsonMessage);
    }

    public void deleteOrderItem(String itemId, String buyerId) {
        OrderItem item = orderItemRepository
                .findByItemIdAndBuyerId(itemId, buyerId).orElseThrow();

        orderItemRepository.delete(item);
    }
}
