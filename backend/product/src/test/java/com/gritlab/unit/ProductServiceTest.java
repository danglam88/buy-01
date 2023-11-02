package com.gritlab.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import com.gritlab.exception.ForbiddenException;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.BinaryData;
import com.gritlab.model.Product;
import com.gritlab.repository.ProductRepository;
import com.gritlab.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.kafka.core.KafkaTemplate;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.NoSuchElementException;

public class ProductServiceTest {

    @InjectMocks
    private ProductService productService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private KafkaTemplate<String, BinaryData> binaryDataKafkaTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void addProductWhenValidData_thenReturnsProduct() throws IOException {
        // Arrange
        Product request = new Product(
                null, "Product Name", "Product Desc", 10.0, 1, null);

        List<MultipartFile> files = new ArrayList<>();
        String userId = "user123";

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        // Act
        Product result = productService.addProduct(request, files, userId);

        assertEquals(result.getName(), request.getName());
        assertEquals(result.getDescription(), request.getDescription());
        assertEquals(result.getPrice(), request.getPrice());
        assertEquals(result.getQuantity(), request.getQuantity());
        assertEquals(result.getUserId(), userId);
    }

    @Test
    void addProductWhenTooManyFiles_thenThrowEx() throws IOException {
        // Arrange
        Product request = new Product(
                null, "Product Name", "Product Desc", 10.0, 1, null);

        List<MultipartFile> files = new ArrayList<>();
        String userId = "user123";

        MultipartFile mockFile1 = mock(MultipartFile.class);
        for (int i = 0; i <= 5; i++) {
            files.add(mockFile1);
        }

        when(mockFile1.getOriginalFilename()).thenReturn("file1.jpg");

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        Throwable exception = assertThrows(InvalidParamException.class, () -> {
            productService.addProduct(request, files, userId);
        });

        assertEquals("Maximum 5 files allowed", exception.getMessage());
    }

    @Test
    void checkFileWhenInvalidFileType_thenThrowEx() throws IOException {

        MultipartFile mockFile1 = mock(MultipartFile.class);

        when(mockFile1.getOriginalFilename()).thenReturn("file1.txt");

        Throwable exception = assertThrows(InvalidParamException.class, () -> {
            productService.checkFile(mockFile1);
        });

        assertEquals("File must be an image", exception.getMessage());
    }

    @Test
    void getExtensionWhenValidFileName_thenReturnExtension() {
        String ext = productService.getExtension("mockFile1.jpg");
        assertEquals("jpg", ext);
    }

    @Test
    void getExtensionWhenInvalidFileName_thenReturnEmptyString() {
        String ext = productService.getExtension("mockFile1");
        assertEquals("", ext);
    }

    @Test
    void updateProductWhenProductIsNotExists_thenThrowAnError() {

        Product request = new Product(
                null, "Product Name", "Product Desc", 10.0, 1, null);

        String userID = "user-id-1";
        String productID = "product-id-1";

        //Mocks for product repository for this case
        when(productRepository.existsById(productID)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> {
            productService.updateProduct(productID, request, userID);
        });
    }

    @Test
    void updateProductWhenProductIsNotBelongToUser_thenThrowAnError() {

        Product request = new Product(
                null, "Product Name", "Product Desc", 10.0, 1, null);

        String userID = "user-id-1";
        String productID = "product-id-1";

        //Mocks for product repository for this case
        when(productRepository.existsById(productID)).thenReturn(true);

        when(productRepository.existsByUserIdAndId(userID, productID)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> {
            productService.updateProduct(productID, request, userID);
        });
    }

    @Test
    void deleteProductWhenProductIsNotExists_thenThrowAnError() {

        String userID = "user-id-1";
        String productID = "product-id-1";

        //Mocks for product repository for this case
        when(productRepository.existsById(productID)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> {
            productService.deleteProduct(productID, userID);
        });
    }

    @Test
    void deleteProductWhenProductIsNotBelongToUser_thenThrowAnError() {
        String userID = "user-id-1";
        String productID = "product-id-1";

        //Mocks for product repository for this case
        when(productRepository.existsById(productID)).thenReturn(true);

        when(productRepository.existsByUserIdAndId(userID, productID)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> {
            productService.deleteProduct(productID, userID);
        });
    }
}

