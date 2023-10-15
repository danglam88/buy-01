package com.gritlab.service;

import com.gritlab.model.Product;
import com.gritlab.model.ProductResponse;
import com.gritlab.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import java.util.Optional;


@Service
public class ProductService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    /*@Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;*/

    @Autowired
    private MediaService mediaService;

    @Value("${media.service.product.url}")
    private String mediaServiceProductUrl;

    @Value("${media.service.media.url}")
    private String mediaServiceMediaUrl;

    public List<ProductResponse> findAll(String token) {
        List<Product> products = productRepository.findAll();
        return this.setImages(products, token);
    }

    public List<ProductResponse> findBySellerId(String sellerId, String token) {
        List<Product> products = productRepository.findAllByUserId(sellerId);
        return this.setImages(products, token);
    }

    public Optional<Product> getProduct(String id) {
        return productRepository.findById(id);
    }

    public Product addProduct(String name, String description, Double price, Integer quantity, String userId) {
        var product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .quantity(quantity)
                .userId(userId)
                .build();

        return  productRepository.save(product);
    }

    public void updateProduct(String id, Product data, String userId) throws NoSuchElementException {

        Product product = productRepository.findByUserIdAndId(userId, id).orElseThrow();

        Product updatedProduct = Product.builder()
            .name(data.getName())
            .description(data.getDescription())
            .price(data.getPrice())
            .quantity(data.getQuantity())
            .id(product.getId())
            .userId(product.getUserId())
            .build();
            productRepository.save(updatedProduct);
    }

    public void deleteProduct(String id, String userId)  {
        if (productRepository.existsByUserIdAndId(userId, id)) {
            //kafkaTemplate.send("DELETE_PRODUCT", id);
            productRepository.deleteById(id);
        }
    }

    private List<ProductResponse> setImages(List<Product> products, String token) {

        List<ProductResponse> productsWithImages = new ArrayList<>();
        ParameterizedTypeReference<List<String>> responseType = new ParameterizedTypeReference<List<String>>() {};

        for (Product product : products) {

            // Create HttpHeaders and add the authorization header
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);

            // Create an HttpEntity with the headers
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List<String>> responseEntity = restTemplate.exchange(mediaServiceProductUrl + product.getId(),  HttpMethod.GET,
                    entity, // Pass null as the request entity
                    responseType);

            // Retrieve the list of Media from the ResponseEntity
            List<String> media = responseEntity.getBody();

            System.out.println(media);

            // Create a ProductWithImages object that includes product data and image data
            ProductResponse productWithImages = new ProductResponse(product);
            productWithImages.setImages(media, mediaServiceMediaUrl);

            productsWithImages.add(productWithImages);
        }

        return productsWithImages;
    }

    /*@KafkaListener(topics = "DELETE_USER", groupId = "my-consumer-group")
    public void consumeMessage(String message) {
        List<Product> products = productRepository.findAllByUserId(message);
        for (Product product : products) {
            kafkaTemplate.send("DELETE_PRODUCT", product.getId());
        }
        productRepository.deleteAllByUserId(message);
    }

    @KafkaListener(topics = "DEFAULT_SELLER", groupId = "my-consumer-group")
    public void consumeMessage2(String message) {
        Product product1 = Product.builder()
                .name("iPhone 15")
                .description("Excellent")
                .price(1499.0)
                .quantity(1)
                .userId(message)
                .build();
        productRepository.save(product1);
        kafkaTemplate.send("DEFAULT_PRODUCT", product1.getId() + " iPhone15.jpg");

        Product product2 = Product.builder()
                .name("MAC Studio")
                .description("Fantastic")
                .price(4899.0)
                .quantity(1)
                .userId(message)
                .build();
        productRepository.save(product2);
        kafkaTemplate.send("DEFAULT_PRODUCT", product2.getId() + " MacStudio.jpg");
    }*/
}
