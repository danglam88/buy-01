package com.gritlab.repository;

import com.gritlab.model.Order;
import com.gritlab.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import com.gritlab.model.TopProduct;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;
import org.bson.Document;

import java.util.List;

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

    @Query("{'orderId': {$in : ?0}}")
    public List<Order> findByOrderIds(List<String> orderIds);
}
