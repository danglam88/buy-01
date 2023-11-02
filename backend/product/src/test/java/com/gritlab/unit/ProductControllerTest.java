package com.gritlab.unit;

import com.gritlab.controller.ProductController;
import com.gritlab.model.Product;
import com.gritlab.model.UserDetails;
import com.gritlab.service.ProductService;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

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
        when(bindingResult.hasErrors()).thenReturn(false);

        // Mock UserDetails
        UserDetails userDetails = mock(UserDetails.class);
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
    public void updateProductWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetails
        UserDetails userDetails = mock(UserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        // Create a sample Product object
        Product updatedProduct = new Product(null, "Updated Product", "Updated product desc",  10.0, 1, null);
        String productId = "product-id-1";

        // Call the controller method
        ResponseEntity<Void> responseEntity = productController.updateProduct(productId, updatedProduct, authentication);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(200, responseEntity.getStatusCodeValue());
    }

    @Test
    public void deleteProductWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetails
        UserDetails userDetails = mock(UserDetails.class);
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
}

