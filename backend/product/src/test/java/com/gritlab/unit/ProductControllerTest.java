package com.gritlab.unit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.controller.ProductController;
import com.gritlab.model.Product;
import com.gritlab.model.ProductDTO;
import com.gritlab.model.UserDetailsJWT;
import com.gritlab.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductControllerTest {

    private ProductController productController;

    @Mock
    private ProductService productService;

    @Mock
    private Authentication authentication;

    @Autowired
    private UriComponentsBuilder ucb;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        productController = new ProductController(productService);
        ucb = UriComponentsBuilder.newInstance();
    }

    @Test
   void testFindAll() throws JsonProcessingException {
        // Arrange
        List<Product> products = createMockProducts(3);
        Mockito.when(productService.findAll()).thenReturn(products);

        // Act
        ResponseEntity<?> response = productController.findAll();

        // Assert
        ObjectMapper objectMapper = new ObjectMapper();
        assertEquals(200, response.getStatusCodeValue());
        String expectedJson = objectMapper.writeValueAsString(products);
        String actualJson = objectMapper.writeValueAsString(response.getBody());
        assertEquals(expectedJson, actualJson);
    }

    @Test
    void testFindBySellerId() throws JsonProcessingException {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("user-id-1");

        List<Product> products = createMockProducts(1);

        Mockito.when(authentication.getPrincipal()).thenReturn(userDetails);
        Mockito.when(productService.findBySellerId(userDetails.getId())).thenReturn(products);

        // Act
        ResponseEntity<?> response = productController.findBySellerId(authentication);

        // Assert
        assertEquals(200, response.getStatusCodeValue());

        ObjectMapper objectMapper = new ObjectMapper();
        String expectedJson = objectMapper.writeValueAsString(products);
        String actualJson = objectMapper.writeValueAsString(response.getBody());
        assertEquals(expectedJson, actualJson);
    }

    @Test
    void testFindById() throws JsonProcessingException {
        // Arrange
        String productId = "product-id-1";
        Product product = createMockProducts(1).get(0);
        Mockito.when(productService.getProduct(productId)).thenReturn(Optional.of(product));

        // Act
        ResponseEntity<?> response = productController.findById(productId);

        ObjectMapper objectMapper = new ObjectMapper();
        // Assert
        assertEquals(200, response.getStatusCodeValue());
        String expectedJson = objectMapper.writeValueAsString(product);
        String actualJson = objectMapper.writeValueAsString(response.getBody());
        assertEquals(expectedJson, actualJson);
    }

    @Test
    void createProductWhenValidInput_thenReturns201() throws MethodArgumentNotValidException {

        // Request params
        ProductDTO product = new ProductDTO("Product Name", "Product Desc", 10.0, 1);
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.hasErrors()).thenReturn(false);

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        // Mock the productService's addProduct method
        List<MultipartFile> files = new ArrayList<>();
        Product newProduct = new Product(
                "product-id1", "Product Name", "Product Desc", 10.0, 1, "id-1"
        );

        // Create a new product as needed
        when(productService.addProduct(product, files, userDetails.getId())).thenReturn(newProduct);

        // Call the controller method
        ResponseEntity<String> responseEntity = productController.createProduct(product, bindingResult, files, authentication, ucb);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(201, responseEntity.getStatusCodeValue());
        assertEquals("/products/product-id1", responseEntity.getHeaders().get("Location").get(0));
    }

    @Test
    void updateProductWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        // Create a sample Product object
        ProductDTO updatedProduct = new ProductDTO("Updated Product", "Updated product desc",  10.0, 1);
        String productId = "product-id-1";

        // Call the controller method
        ResponseEntity<Void> responseEntity = productController.updateProduct(productId, updatedProduct, authentication);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    void deleteProductWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        // Create a sample Product id
        String productId = "product-id-1";

        // Call the controller method
        ResponseEntity<Void> responseEntity = productController.deleteProduct(productId, authentication);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    List<Product> createMockProducts(int length) {
        List<Product> list = new ArrayList<>();

        for (int i = 1; i <= length; i++) {
            list.add(new Product(
                    "product-id-" + i, "Product Name", "Product Desc", 10.0, 1, "user-id-" + i
            ));
        }
        return list;
    }
}

