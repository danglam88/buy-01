package com.gritlab.service;

import com.gritlab.model.BinaryData;
import com.gritlab.model.Product;
import com.gritlab.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

import java.util.Optional;


@Service
public class ProductService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private KafkaTemplate<String, BinaryData> binaryDataKafkaTemplate;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<Product> findBySellerId(String sellerId) {
        return productRepository.findAllByUserId(sellerId);
    }

    public Optional<Product> getProduct(String id) {
        return productRepository.findById(id);
    }

    public Product addProduct(Product request, List<MultipartFile> files, String userId) {

        var product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .userId(userId)
                .build();

        Product newProduct = productRepository.save(product);

        for (MultipartFile file : files) {
            try {
                String base64String = Base64.getEncoder().encodeToString(file.getBytes());
                BinaryData binaryData = new BinaryData(newProduct.getId(), file.getOriginalFilename(), base64String);
                binaryDataKafkaTemplate.send("BINARY_DATA", binaryData);
            } catch (IOException e) {
                throw new RuntimeException("Error reading file content", e);
            }
        }

        return newProduct;
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
            kafkaTemplate.send("DELETE_PRODUCT", id);
            productRepository.deleteById(id);
        }
    }

    @KafkaListener(topics = "DELETE_USER", groupId = "my-consumer-group")
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
    }

    @KafkaListener(topics = "CHECK_PRODUCT_REQUEST", groupId = "my-consumer-group")
    public void checkProduct(String message) {

        System.out.println(message);

        String[] params = message.split(",");
        if (params.length == 2) {
            String productId = params[0];
            String userId = params[1];

            Optional<Product> product = productRepository.findByUserIdAndId(userId, productId);

            if (product.isPresent()) {
                kafkaTemplate.send("CHECK_PRODUCT_RESPONSE",message, "valid");
            } else {
                kafkaTemplate.send("CHECK_PRODUCT_RESPONSE",message, "invalid");
            }
        }
    }
}