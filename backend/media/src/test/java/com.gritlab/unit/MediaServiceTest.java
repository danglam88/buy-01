package com.gritlab.unit;

import com.gritlab.exception.ForbiddenException;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.BinaryData;
import com.gritlab.model.Media;
import com.gritlab.repository.MediaRepository;
import com.gritlab.service.MediaService;
import com.gritlab.service.ProductCheckService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class MediaServiceTest {

    @InjectMocks
    private MediaService mediaService;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private KafkaTemplate<String, BinaryData> binaryDataKafkaTemplate;

    @Mock
    private ProductCheckService productCheckService;


    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testGetByProductId() {
        // Arrange
        String productId = "yourProductId";
        List<Media> mediaList = new ArrayList<>();
        byte[] imageData = new byte[10];
        mediaList.add(new Media("1", "image-path", "product-id", imageData));

        when(mediaRepository.findByProductId(productId)).thenReturn(Optional.of(mediaList));

        // Act
        List<String> result = mediaService.getByProductId(productId);

        // Assert
        assertEquals(1, result.size());
        assertEquals("1", result.get(0));
    }

    @Test
    void addMediaWhenMediaNotBelongToUser_thenThrowEx() throws IOException, InterruptedException {

        String productId = "product-id-1";
        String userId = "user-id-1";

        // Mock the waitForResponse method to return "invalid"
        when(productCheckService.waitForResponse(Mockito.anyString(), Mockito.anyLong())).thenReturn("invalid");

        // Create and save the mock image
        createMockImage("mock_image.jpg");

        // Convert the mock image to a MultipartFile
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                "mock_image.jpg",
                "image/jpeg", // Set the content type
                Files.readAllBytes(Paths.get("mock_image.jpg")) // Load the image bytes
        );

        Throwable exception = assertThrows(ForbiddenException.class, () -> {
            mediaService.addMedia(multipartFile, productId, userId);
        });
    }

    @Test
    void addMediaWhenValidData_thenThrowNothing() throws IOException, InterruptedException {

        String productId = "product-id-1";
        String userId = "user-id-1";

        // Create and save the mock image
        createMockImage("mock_image.jpg");

        // Convert the mock image to a MultipartFile
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                "mock_image.jpg",
                "image/jpeg", // Set the content type
                Files.readAllBytes(Paths.get("mock_image.jpg")) // Load the image bytes
        );

        // Mock the waitForResponse method to return "valid"
        when(productCheckService.waitForResponse(Mockito.anyString(), Mockito.anyLong())).thenReturn("valid");

        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        mediaService.addMedia(multipartFile, productId, userId);
    }

    @Test
    void deleteMediaWhenProductNotExist_thenThrowEx() throws IOException, InterruptedException {

        String productId = "product-id-1";
        String userId = "user-id-1";

        Throwable exception = assertThrows(NoSuchElementException.class, () -> {
            mediaService.deleteMedia(productId, userId);
        });
    }

    @Test
    void deleteMediaWhenMediaNotBelongToUser_thenThrowEx() throws IOException, InterruptedException {

        String productId = "product-id-1";
        String userId = "user-id-1";

        // Mock the waitForResponse method to return "invalid"
        when(productCheckService.waitForResponse(Mockito.anyString(), Mockito.anyLong())).thenReturn("invalid");

        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });
        when(mediaRepository.findById(any(String.class))).thenAnswer(invocation ->  Optional.of(new Media()));

        Throwable exception = assertThrows(ForbiddenException.class, () -> {
            mediaService.deleteMedia(productId, userId);
        });
    }

    @Test
    void deleteMediaWhenValidData_thenThrowNothing() throws IOException, InterruptedException {

        String productId = "product-id-1";
        String userId = "user-id-1";

        // Mock the waitForResponse method to return "valid"
        when(productCheckService.waitForResponse(Mockito.anyString(), Mockito.anyLong())).thenReturn("valid");

        when(mediaRepository.save(any(Media.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });
        when(mediaRepository.findById(any(String.class))).thenAnswer(invocation ->  Optional.of(new Media()));

        mediaService.deleteMedia(productId, userId);
    }

    @Test
    void checkFileWhenInvalidFileType_thenThrowEx() throws IOException {

        MultipartFile mockFile1 = mock(MultipartFile.class);

        when(mockFile1.getOriginalFilename()).thenReturn("file1.txt");

        Throwable exception = assertThrows(InvalidParamException.class, () -> {
            mediaService.checkFile(mockFile1);
        });

        assertEquals("File must be an image", exception.getMessage());
    }

    @Test
    void getImageTypeWhenValidExtension_thenReturnMediaType() {
        MediaType type = mediaService.getImageType("mockFile1.png");
        assertEquals(MediaType.IMAGE_PNG, type);
    }

    @Test
    void getExtensionWhenValidFileName_thenReturnExtension() {
        String ext = mediaService.getExtension("mockFile1.jpg");
        assertEquals("jpg", ext);
    }

    @Test
    void getExtensionWhenInvalidFileName_thenReturnEmptyString() {
        String ext = mediaService.getExtension("mockFile1");
        assertEquals("", ext);
    }

    public void createMockImage(String filePath) {
        BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_RGB);

        // Set the entire image to white
        for (int x = 0; x < image.getWidth(); x++) {
            for (int y = 0; y < image.getHeight(); y++) {
                image.setRGB(x, y, 0xFFFFFF); // RGB for white
            }
        }

        try {
            ImageIO.write(image, "jpg", new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
