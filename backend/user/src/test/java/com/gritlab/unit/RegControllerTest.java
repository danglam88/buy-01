package com.gritlab.unit;

import com.gritlab.controller.RegController;
import com.gritlab.model.RegRequest;
import com.gritlab.model.Role;
import com.gritlab.model.User;
import com.gritlab.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegControllerTest {

    private RegController regController;

    @Mock
    private UserService userService;

    @Autowired
    private UriComponentsBuilder ucb;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
        regController = new RegController(userService);
        ucb = UriComponentsBuilder.newInstance();
    }

    @Test
    void testRegisterNewAccountWhenValidInputThenReturns201() throws MethodArgumentNotValidException {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.hasErrors()).thenReturn(false);

        // Request params
        RegRequest regRequest = new RegRequest("Test Name",
                "test@mail.com", "Test1@", "SELLER");

        // Mock the userService's createAccount method data
        MultipartFile file = new MockMultipartFile("avatar",
                "avatar.png", "image/png", "avatar".getBytes());

        User newUser = new User("user-id1", "Test Name", "test@mail.com",
                "Test1@", Role.SELLER, "avatar.png", "avatar".getBytes());

        // Create a new account as needed
        when(userService.createAccount(regRequest, file)).thenReturn(newUser);

        // Call the controller method
        ResponseEntity<Void> responseEntity = regController.registerNewAccount(regRequest, bindingResult, file, ucb);

        // Assertions
        assertNotNull(responseEntity);

        assertEquals(201, responseEntity.getStatusCodeValue());
        assertEquals("/users/user-id1", responseEntity.getHeaders().get("Location").get(0));
    }
}
