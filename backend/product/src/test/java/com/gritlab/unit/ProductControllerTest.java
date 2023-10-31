package com.gritlab.unit;

import com.gritlab.controller.ProductController;
import com.gritlab.model.Product;
import com.gritlab.model.UserDetails;
import com.gritlab.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ProductControllerTest {

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
    public void createProductWhenValidInput_thenReturns201() throws MethodArgumentNotValidException {
        // Request params
        Product product = new Product(
                null, "Product Name", "Product Desc", 10.0, 1, null
        );
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.hasErrors()).thenReturn(false); // You can change this based on your test scenario

        // Mock UserDetails
        UserDetails userDetails = mock(UserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1"); // Replace with your user ID

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
}

