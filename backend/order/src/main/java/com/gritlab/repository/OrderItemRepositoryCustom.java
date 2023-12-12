package com.gritlab.repository;

import com.gritlab.model.OrderStatus;
import com.gritlab.model.TopProduct;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public class OrderItemRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    private static final String PRODUCT_ID = "productId";
    private static final String ORDER_ITEM = "order_item";
    private static final String TOTAL_QUANTITY = "totalQuantity";
    private static final String STATUS_CODE = "statusCode";
    private static final String TOTAL_ITEM_PRICE = "totalItemPrice";

    public OrderItemRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<TopProduct> sumQuantityByProductIdAndBuyerId(String buyerId) {
        GroupOperation groupOperation = Aggregation.group(PRODUCT_ID)
                .first(PRODUCT_ID).as(PRODUCT_ID)
                .first("name").as("name")
                .sum("quantity").as(TOTAL_QUANTITY);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("buyerId").is(buyerId).and(STATUS_CODE).is(OrderStatus.CONFIRMED)),
                groupOperation,
                Aggregation.sort(Sort.Direction.DESC, TOTAL_QUANTITY),
                Aggregation.limit(1)
        );

        AggregationResults<TopProduct> results = mongoTemplate.aggregate(aggregation, ORDER_ITEM, TopProduct.class);
        return  results.getMappedResults();
    }

    public List<TopProduct> sumQuantityByProductIdAndSellerId(String sellerId) {
        GroupOperation groupOperation = Aggregation.group(PRODUCT_ID)
                .first(PRODUCT_ID).as(PRODUCT_ID)
                .first("name").as("name")
                .sum("quantity").as(TOTAL_QUANTITY);

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("sellerId").is(sellerId).and(STATUS_CODE).is(OrderStatus.CONFIRMED)),
                groupOperation,
                Aggregation.sort(Sort.Direction.DESC, TOTAL_QUANTITY),
                Aggregation.limit(1)
        );

        AggregationResults<TopProduct> results = mongoTemplate.aggregate(aggregation, ORDER_ITEM, TopProduct.class);
        return results.getMappedResults();
    }

    public Double getTotalSumItemPriceByBuyerId(String buyerId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("buyerId").is(buyerId)
                        .and(STATUS_CODE).is(OrderStatus.CONFIRMED)),
                Aggregation.project()
                        .andExpression("itemPrice * quantity").as("priceTimesQuantity"),
                Aggregation.group()
                        .sum("priceTimesQuantity").as(TOTAL_ITEM_PRICE)
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, ORDER_ITEM, Document.class);
        Document resultDocument = results.getUniqueMappedResult();

        return resultDocument == null ? 0.0 : resultDocument.getDouble(TOTAL_ITEM_PRICE);
    }

    public Double getTotalSumItemPriceBySellerId(String sellerId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("sellerId").is(sellerId)
                        .and(STATUS_CODE).is(OrderStatus.CONFIRMED)),
                Aggregation.project()
                        .andExpression("itemPrice * quantity").as("priceTimesQuantity"),
                Aggregation.group()
                        .sum("priceTimesQuantity").as(TOTAL_ITEM_PRICE)
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, ORDER_ITEM, Document.class);
        Document resultDocument = results.getUniqueMappedResult();

        return resultDocument == null ? 0.0 : resultDocument.getDouble(TOTAL_ITEM_PRICE);
    }
}
