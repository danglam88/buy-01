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
    public Optional<OrderItem> findByItemIdAndBuyerIdAndProductIdAndOrderId(String itemId,
                                                                String buyerId, String productId, String orderId);
    public Optional<OrderItem> findByItemIdAndBuyerIdAndOrderIdIsNull(String itemId, String buyerId);
    public List<OrderItem> findByBuyerIdAndOrderIdIsNull(String buyerId);
    public Optional<OrderItem> findByBuyerIdAndProductIdAndOrderIdIsNull(String buyerId, String productId);
    public List<OrderItem> findByOrderId(String orderId);
    public List<OrderItem> findByOrderIdAndBuyerId(String orderId, String buyerId);
    public List<OrderItem> findBySellerIdAndOrderIdIsNotNull(String sellerId);

    @Query("{'orderId': {$in : ?0}}")
    public List<Order> findByOrderIds(List<String> orderIds);
}
