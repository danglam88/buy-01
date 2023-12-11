package com.gritlab.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.exception.ForbiddenException;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.ProductRepository;
import com.gritlab.utility.ImageFileTypeChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;

import java.util.Optional;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final String[] allowedExtensions = {"png", "gif", "jpeg", "jpg"};

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

    public void checkFile(MultipartFile file) throws InvalidParamException {

        if (file.isEmpty()) {
            throw new InvalidParamException("File must not be empty");
        }

        try {
            if (!ImageFileTypeChecker.isImage(file)) {
                throw new InvalidParamException("File must be an image");
            }
        } catch (IOException ex) {
            throw new InvalidParamException("Failed to upload file");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new InvalidParamException("File size must be less than 2MB");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!isValidExtension(extension)) {
            throw new InvalidParamException("Allowed extensions: " + String.join(",", allowedExtensions));
        }
    }

    public String getExtension(String fileName) {

        String extension = "";

        if (fileName != null && !fileName.isEmpty()) {
            int lastDotIndex = fileName.lastIndexOf(".");

            if (lastDotIndex > 0) {
                extension = fileName.substring(lastDotIndex + 1).toLowerCase();
            }
        }
        return extension;
    }

    public boolean isValidExtension(String extension) {
        for (String allowedExtension : allowedExtensions) {
            if (allowedExtension.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    public Product addProduct(ProductDTO request, List<MultipartFile> files, String userId) {

        if (files.size() > 5) {
            throw new InvalidParamException("Maximum 5 files allowed");
        }

        for (MultipartFile file : files) {
            checkFile(file);
        }

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
                productRepository.deleteById(newProduct.getId());
                throw new InvalidParamException("Error reading file content");
            }
        }

        return newProduct;
    }

    public void updateProduct(String id, ProductDTO data, String userId) throws NoSuchElementException {

        if (productRepository.existsById(id)) {
            if (productRepository.existsByUserIdAndId(userId, id)) {
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
            } else {
                throw new ForbiddenException("Access denied");
            }
        } else {
            throw new NoSuchElementException();
        }
    }

    public void deleteProduct(String id, String userId)  {
        if (productRepository.existsById(id)) {
            if (productRepository.existsByUserIdAndId(userId, id)) {
                kafkaTemplate.send("DELETE_PRODUCT", id);
                productRepository.deleteById(id);
            } else {
                throw new ForbiddenException("Access denied");
            }
        } else {
            throw new NoSuchElementException();
        }
    }

    @KafkaListener(topics = "DELETE_USER", groupId = "my-consumer-group")
    public void deleteUser(String message) {
        List<Product> products = productRepository.findAllByUserId(message);
        for (Product product : products) {
            kafkaTemplate.send("DELETE_PRODUCT", product.getId());
        }
        productRepository.deleteAllByUserId(message);
    }

    @KafkaListener(topics = "CHECK_PRODUCT_REQUEST", groupId = "my-consumer-group")
    public void checkProductRequest(String message) {

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

    @KafkaListener(topics = "CREATE_ORDER_REQUEST", groupId = "my-consumer-group")
    public void createOrderRequest(String message) {
        // Deserialize JSON to Order
        Order order = convertFromJsonToOrder(message);

        assert order != null;
        List<OrderItem> items = order.getItems();

        for (OrderItem orderItem: items) {
            Optional<Product> product = productRepository.findById(orderItem.getProductId());

            if (product.isEmpty() || product.get().getQuantity() < orderItem.getQuantity()) {
                orderItem.setProductId(null);
            } else {
                orderItem.setMaxQuantity(product.get().getQuantity());
            }
        }

        order.setItems(items);

        // Serialize Order to JSON
        String jsonMessage = convertFromOrderToJson(order);

        kafkaTemplate.send("CREATE_ORDER_RESPONSE", jsonMessage);
    }

    @KafkaListener(topics = "CREATE_CART_REQUEST", groupId = "my-consumer-group")
    public void createCartRequest(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        assert orderItem != null;
        Optional<Product> product = productRepository.findById(orderItem.getProductId());

        if (product.isEmpty() || product.get().getQuantity() <= 0) {
            orderItem.setProductId(null);
        } else {
            orderItem.setName(product.get().getName());
            orderItem.setDescription(product.get().getDescription());
            orderItem.setItemPrice(product.get().getPrice());
            orderItem.setSellerId(product.get().getUserId());
            orderItem.setMaxQuantity(product.get().getQuantity());

            if (orderItem.getQuantity() > product.get().getQuantity()) {
                orderItem.setQuantity(product.get().getQuantity());
            }
        }

        // Serialize OrderItem to JSON
        String jsonMessage = convertFromOrderItemToJson(orderItem);

        kafkaTemplate.send("CREATE_CART_RESPONSE", jsonMessage);
    }

    @KafkaListener(topics = "UPDATE_STATUS_REQUEST", groupId = "my-consumer-group")
    public void updateStatusRequest(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        assert orderItem != null;
        Optional<Product> product = productRepository.findById(orderItem.getProductId());

        if (product.isEmpty() || product.get().getQuantity() <= 0) {
            orderItem.setStatusCode(OrderStatus.CANCELLED);
        } else {
            orderItem.setName(product.get().getName());
            orderItem.setDescription(product.get().getDescription());
            orderItem.setItemPrice(product.get().getPrice());
            orderItem.setMaxQuantity(product.get().getQuantity());

            if (orderItem.getQuantity() > product.get().getQuantity()) {
                orderItem.setStatusCode(OrderStatus.CANCELLED);
            }

            if (orderItem.getStatusCode() == OrderStatus.CONFIRMED) {
                // Reduce product quantity when order item is confirmed
                product.get().setQuantity(product.get().getQuantity() - orderItem.getQuantity());
                productRepository.save(product.get());
            }
        }

        // Serialize OrderItem to JSON
        String jsonMessage = convertFromOrderItemToJson(orderItem);

        kafkaTemplate.send("UPDATE_STATUS_RESPONSE", jsonMessage);
    }

    @KafkaListener(topics = "UPDATE_PRODUCT_QUANTITY", groupId = "my-consumer-group")
    public void updateProductQuantity(String message) {
        // Deserialize JSON to OrderItem
        OrderItem orderItem = convertFromJsonToOrderItem(message);

        assert orderItem != null;
        if (orderItem.getStatusCode() == OrderStatus.CONFIRMED) {
            Optional<Product> product = productRepository.findById(orderItem.getProductId());

            if (product.isPresent()) {
                product.get().setQuantity(product.get().getQuantity() + orderItem.getQuantity());
                productRepository.save(product.get());
            }
        }
    }

    private OrderItem convertFromJsonToOrderItem(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, OrderItem.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from json to order item : {}", e.getMessage());
            return null;
        }
    }

    private String convertFromOrderItemToJson(OrderItem item) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(item);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from order item to json : {}", e.getMessage());
            return null;
        }
    }

    private Order convertFromJsonToOrder(String jsonMessage) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(jsonMessage, Order.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from json to order : {}", e.getMessage());
            return null;
        }
    }

    private String convertFromOrderToJson(Order order) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(order);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert from order to json : {}", e.getMessage());
            return null;
        }
    }
}
