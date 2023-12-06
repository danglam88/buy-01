package com.gritlab.repository;

import com.gritlab.model.Order;
import com.gritlab.model.OrderItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface OrderItemRepository extends MongoRepository<OrderItem, String> {

    public Optional<OrderItem> findByItemIdAndBuyerIdAndProductIdAndOrderIdIsNull(String itemId,
                                                                                  String buyerId, String productId);
    public Optional<OrderItem> findByItemIdAndSellerIdAndProductIdAndOrderId(String itemId,
                                                                  String sellerId, String productId, String orderId);
    public Optional<OrderItem> findByItemIdAndBuyerId(String itemId, String buyerId);
    public Optional<OrderItem> findByProductIdAndOrderIdIsNull(String productId);
    public List<OrderItem> findByBuyerIdAndOrderIdIsNull(String buyerId);

    public List<OrderItem> findByOrderId(String orderId);
    public List<OrderItem> findBySellerIdAndOrderIdIsNotNull(String sellerId);

    @Query("{'orderId': {$in : ?0}}")
    public List<Order> findByOrderIds(List<String> orderIds);
}
