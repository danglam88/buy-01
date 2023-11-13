package com.gritlab.unit;

import com.gritlab.controller.MediaController;
import com.gritlab.model.Media;
import com.gritlab.model.UserDetailsJWT;
import com.gritlab.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MediaControllerTest {

    private MediaController mediaController;

    @Mock
    private MediaService mediaService;

    @Mock
    private Authentication authentication;

    @Autowired
    private UriComponentsBuilder ucb;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        mediaController = new MediaController(mediaService);
        ucb = UriComponentsBuilder.newInstance();
    }

    @Test
    void testFindById() throws IOException {
        // Arrange
        String mediaId = "media-id-1";
        String productId = "product-id-1";
        byte[] imageData = "This is a test image data".getBytes();
        Media mockMedia = new Media(mediaId, "test.jpg", productId, imageData);

        when(mediaService.getMedia(mediaId)).thenReturn(Optional.of(mockMedia));

        // Act
        ResponseEntity<ByteArrayResource> response = mediaController.findById(mediaId);

        // Assert
        assertEquals(200, response.getStatusCodeValue());

        ByteArrayResource resource = response.getBody();
        byte[] resourceData = new byte[(int) resource.contentLength()];
        resource.getInputStream().read(resourceData);

        assertEquals(new String(imageData), new String(resourceData));
    }

    @Test
    void testFindByIdNotFound() {
        // Arrange
        String mediaId = "nonExistentMediaId";

        when(mediaService.getMedia(mediaId)).thenReturn(Optional.empty());

        Throwable exception = assertThrows(NoSuchElementException.class, () -> {
            mediaController.findById(mediaId);
        });
    }

    @Test
    void uploadFileWhenValidInput_thenReturns200() throws Exception {

        String userId = "id-1";
        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn(userId);

        String productId = "product-id-1";
        String fileName = "file1.jpg";

        MultipartFile mockFile1 = mock(MultipartFile.class);
        when(mockFile1.getOriginalFilename()).thenReturn("file1.jpg");

        Media newMedia = new Media("media-id", fileName, productId, new byte[10]);

        when(mediaService.addMedia(mockFile1, productId, userId)).thenAnswer(invocation -> newMedia);

        // Call the controller method
        ResponseEntity<String> responseEntity = mediaController.uploadFile(mockFile1, productId, authentication, ucb);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(201, responseEntity.getStatusCodeValue());
        assertEquals("/media/" + newMedia.getId(), responseEntity.getHeaders().get("Location").get(0));
    }

    @Test
    void deleteMediaWhenValidInput_thenReturns200() throws Exception {

        // Mock UserDetailsJWT
        UserDetailsJWT userDetails = mock(UserDetailsJWT.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getId()).thenReturn("id-1");

        // Create a sample Media id
        String mediaId = "media-id-1";

        // Call the controller method
        ResponseEntity<Void> responseEntity = mediaController.deleteMedia(mediaId, authentication);

        // Assertions
        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCodeValue());
    }
}
