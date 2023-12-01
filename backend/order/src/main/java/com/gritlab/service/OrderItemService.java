package com.gritlab.service;

import com.gritlab.model.OrderItem;
import com.gritlab.model.OrderItemDTO;
import com.gritlab.model.CartItemResponse;
import com.gritlab.model.ProductDTO;
import com.gritlab.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    public List<CartItemResponse> getOrderItems(String buyerId) {
        List<OrderItem> items = orderItemRepository.findByBuyerIdAndOrderIdIsNull(buyerId);
        List<CartItemResponse> responseItems = new ArrayList<>();

        for (OrderItem item : items) {
            ProductDTO product = new ProductDTO(item.getProductId(), "Mock name", "Mock description", 101.01, 1,  "mockId");
             CartItemResponse responseItem = CartItemResponse.builder()
                     .itemId(item.getItemId())
                     .quantity(item.getQuantity())
                     //.positionPrice(item.getPositionPrice())
                     .itemPrice(101.01 * item.getQuantity())
                     .product(product).build();

            responseItems.add(responseItem);
        }

        return responseItems;
    }

    public String addOrderItem(String buyerId, OrderItemDTO data) {

        //todo check product quantity
        //todo check that product is exists
        //todo reach data with product info
        OrderItem item = OrderItem.builder()
                .productId(data.getProductId())
                .quantity(data.getQuantity())
                .buyerId(buyerId)
                .sellerId(null)
                .orderId(null)
                .itemPrice(null)
                .build();

        OrderItem newItem = orderItemRepository.save(item);
        return newItem.getItemId();
    }

    public void updateOrderItem(String itemId, String userId, OrderItemDTO data) {

        //todo check product quantity
        //todo check that product is exists
        OrderItem position = orderItemRepository
                .findByItemIdAndBuyerIdAndProductId(itemId, userId, data.getProductId()).orElseThrow();
        position.setQuantity(data.getQuantity());
        orderItemRepository.save(position);
    }

    public void deleteOrderItem(String itemId, String userId) {

        OrderItem position = orderItemRepository
                .findByItemIdAndBuyerId(itemId, userId).orElseThrow();

        orderItemRepository.delete(position);
    }
}
