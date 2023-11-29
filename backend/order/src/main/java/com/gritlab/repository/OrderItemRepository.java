package com.gritlab.repository;

import com.gritlab.model.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends MongoRepository<OrderItem, String> {
    public Optional<OrderItem> findByItemIdAndBuyerIdAndProductId(String itemId, String buyerId, String productId);
    public Optional<OrderItem> findByItemIdAndBuyerId(String itemId, String buyerId);
    public  List<OrderItem> findByBuyerIdAndOrderIdIsNull(String buyerId);
}
