package com.gritlab.repository;

import com.gritlab.model.Media;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;


@Component
@RepositoryRestResource(collectionResourceRel = "media", path = "media")
public interface MediaRepository extends MongoRepository<Media, String> {
    void deleteAllByProductId(String productId);
    Optional<List<Media>> findByProductId(String productId);
}
