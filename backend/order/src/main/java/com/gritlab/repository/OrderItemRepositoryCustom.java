package com.gritlab.repository;

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

    public OrderItemRepositoryCustom(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<TopProduct> sumQuantityByProductIdAndBuyerId(String buyerId) {
        GroupOperation groupOperation = Aggregation.group("productId")
                .first("productId").as("productId")
                .first("name").as("name")
                .sum("quantity").as("totalQuantity");

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("buyerId").is(buyerId)),
                groupOperation,
                Aggregation.sort(Sort.Direction.DESC, "totalQuantity"),
                Aggregation.limit(1)
        );

        AggregationResults<TopProduct> results = mongoTemplate.aggregate(aggregation, "order_item", TopProduct.class);
        return  results.getMappedResults();
    }


    public Double getTotalSumItemPriceByBuyerId(String buyerId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("buyerId").is(buyerId)),
                Aggregation.group()
                        .sum("itemPrice").as("totalItemPrice")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "order_item", Document.class);
        Document resultDocument = results.getUniqueMappedResult();

        return resultDocument == null ? 0.0 : resultDocument.getDouble("totalItemPrice");
    }
}