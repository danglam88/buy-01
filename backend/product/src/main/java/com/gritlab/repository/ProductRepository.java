package com.gritlab.repository;

import com.gritlab.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;


@RepositoryRestResource(collectionResourceRel = "products", path = "products")
public interface ProductRepository extends MongoRepository<Product, String> {
    Optional <Product> findByUserIdAndId(String userId, String id);
    boolean existsByUserIdAndId(String userId, String id);
    void deleteAllByUserId(String userId);
    List<Product> findAllByUserId(String userId);
}
