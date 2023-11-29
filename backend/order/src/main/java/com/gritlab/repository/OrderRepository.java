package com.gritlab.repository;

import com.gritlab.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;


@Component
@RepositoryRestResource(collectionResourceRel = "order", path = "order")
public interface OrderRepository extends MongoRepository<Order, String> {
}