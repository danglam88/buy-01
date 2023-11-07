package com.gritlab.unit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.controller.UserController;
import com.gritlab.model.*;
import com.gritlab.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class UserControllerTest {

    private UserController userController;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @Autowired
    private UriComponentsBuilder ucb;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        userController = new UserController(userService);
        ucb = UriComponentsBuilder.newInstance();
    }

    @Test
    public void testGetUserInfo() throws JsonProcessingException {
        User authorizedUser = mock(User.class);
        when(userService.authorizeUser(authentication, null)).thenReturn(authorizedUser);

        ObjectMapper objectMapper = new ObjectMapper();

        // Mock the userService's getUserById method data
        UserDTO userDTO = new UserDTO("user-id1", "Test Name", "test@mail.com",
                "Test1@", "SELLER", "avatar.png", "avatar".getBytes());
        when(userService.convertToDto(authorizedUser)).thenReturn(userDTO);

        // Call the controller method
        ResponseEntity<?> response = userController.getUserInfo(authentication);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        String expectedJson = objectMapper.writeValueAsString(userDTO);
        String actualJson = objectMapper.writeValueAsString(response.getBody());
        assertEquals(expectedJson, actualJson);
    }

    @Test
    public void testGetAvatarById() throws IOException {
        // Create a sample User id
        String userId = "user-id1";

        User authorizedUser = mock(User.class);
        when(userService.authorizeUser(authentication, userId)).thenReturn(authorizedUser);

        // Act
        ResponseEntity<ByteArrayResource> response = userController.getAvatarById(userId, authentication);

        // Assert
        assertEquals(200, response.getStatusCodeValue());

        ByteArrayResource resource = response.getBody();
        byte[] resourceData = new byte[(int) resource.contentLength()];
        resource.getInputStream().read(resourceData);

        assertEquals(new String(authorizedUser.getAvatarData()), new String(resourceData));
    }

    @Test
    public void testGetUserById() throws JsonProcessingException {
        // Create a sample User id
        String userId = "user-id1";

        User authorizedUser = mock(User.class);
        when(userService.authorizeUser(authentication, userId)).thenReturn(authorizedUser);

        ObjectMapper objectMapper = new ObjectMapper();

        // Mock the userService's getUserById method data
        UserDTO userDTO = new UserDTO(userId, "Test Name", "test@mail.com",
                "Test1@", "SELLER", "avatar.png", "avatar".getBytes());
        when(userService.convertToDto(authorizedUser)).thenReturn(userDTO);

        // Call the controller method
        ResponseEntity<?> response = userController.getUserById(userId, authentication);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        String expectedJson = objectMapper.writeValueAsString(userDTO);
        String actualJson = objectMapper.writeValueAsString(response.getBody());
        assertEquals(expectedJson, actualJson);
    }

    @Test
    public void updateUserWhenValidInput_thenReturns200() throws MethodArgumentNotValidException {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.hasErrors()).thenReturn(false);

        // Create a sample User id
        String userId = "user-id1";

        User authorizedUser = mock(User.class);
        when(userService.authorizeUser(authentication, userId)).thenReturn(authorizedUser);

        // Request params
        UserRequest userRequest = new UserRequest("Test2 Name",
                "test2@mail.com", "Test2@", "SELLER");

        // Mock the userService's updateUser method data
        MultipartFile file = new MockMultipartFile("avatar2",
                "avatar2.gif", "image/gif", "avatar2".getBytes());

        User updatedUser = new User(userId, "Test2 Name", "test2@mail.com",
                "Test2@", Role.SELLER, "avatar2.gif", "avatar2".getBytes());

        // Update an existing user as needed
        when(userService.updateUser(userId, userRequest, file)).thenReturn(updatedUser);

        // Call the controller method
        ResponseEntity<?> responseEntity = userController.updateUser(userId, userRequest,
                bindingResult, file, ucb, authentication);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(200, responseEntity.getStatusCodeValue());
        assertEquals("/users/" + userId, responseEntity.getHeaders().get("Location").get(0));
    }

    @Test
    public void deleteUserWhenValidInput_thenReturns200() throws Exception {

        // Create a sample User id
        String userId = "user-id1";

        User authorizedUser = mock(User.class);
        when(userService.authorizeUser(authentication, userId)).thenReturn(authorizedUser);

        // Call the controller method
        ResponseEntity<?> responseEntity = userController.deleteUser(userId, authentication);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(200, responseEntity.getStatusCodeValue());
    }
}
