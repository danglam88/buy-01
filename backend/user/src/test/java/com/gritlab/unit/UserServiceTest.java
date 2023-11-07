package com.gritlab.unit;

import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.UserRepository;
import com.gritlab.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private Authentication authentication;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void checkFileWhenInvalidFileType_thenThrowEx() throws IOException {

        MultipartFile mockFile1 = mock(MultipartFile.class);

        when(mockFile1.getOriginalFilename()).thenReturn("file1.txt");

        Throwable exception = assertThrows(InvalidParamException.class, () -> {
            userService.checkFile(mockFile1);
        });

        assertEquals("File must be an image", exception.getMessage());
    }

    @Test
    void getExtensionWhenValidFileName_thenReturnExtension() {
        String ext = userService.getExtension("mockFile1.jpg");
        assertEquals("jpg", ext);
    }

    @Test
    void getExtensionWhenInvalidFileName_thenReturnEmptyString() {
        String ext = userService.getExtension("mockFile1");
        assertEquals("", ext);
    }

    @Test
    void isValidExtension_WhenValid_thenReturnTrue() {
        assertTrue(userService.isValidExtension("jpg"));
    }

    @Test
    void isValidExtension_WhenInvalid_thenReturnFalse() {
        assertFalse(userService.isValidExtension("exe"));
    }

    @Test
    void getImageTypeWhenValidExtension_thenReturnImageType() {
        MediaType type = userService.getImageType("mockFile1.png");
        assertEquals(MediaType.IMAGE_PNG, type);
    }

    @Test
    void createAccountWhenValidData_thenReturnsUser() throws IOException {
        // Request params
        RegRequest regRequest = new RegRequest("Test Name",
                "test@mail.com", "Test1@", "SELLER");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        // Act
        User result = userService.createAccount(regRequest, null);

        assertEquals(result.getName(), regRequest.getName());
        assertEquals(result.getEmail(), regRequest.getEmail());
        assertEquals(result.getPassword(), passwordEncoder.encode(
                regRequest.getPassword() + result.getId()));
        assertEquals(result.getRole().toString(), regRequest.getRole());
        assertEquals(result.getAvatar(), null);
        assertEquals(result.getAvatarData(), null);
    }

    @Test
    void updateUserWhenRequestIsValid_thenReturnsUser() {
        // Create a sample User id
        String userId = "user-id1";

        // Request params
        UserRequest userRequest = new UserRequest("Test2 Name",
                "test2@mail.com", "Test2@", "SELLER");

        User user = new User(userId, "Test Name", "test@mail.com",
                "Test1@", Role.SELLER, "avatar.png", "avatar".getBytes());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            return invocation.getArgument(0);
        });

        // Act
        User result = userService.updateUser(userId, userRequest, null);

        assertEquals(result.getName(), userRequest.getName());
        assertEquals(result.getEmail(), userRequest.getEmail());
        assertEquals(result.getPassword(), passwordEncoder.encode(
                userRequest.getPassword() + userId));
        assertEquals(result.getRole().toString(), userRequest.getRole());
        assertEquals(result.getAvatar(), null);
        assertEquals(result.getAvatarData(), null);
    }

    @Test
    void authorizeUserWhenValidData_thenReturnsUser() {
        // Create a sample User id
        String userId = "user-id1";

        when(userService.findUserById(userId)).thenReturn(true);

        User user = new User(userId, "Test Name", "test@mail.com",
                "Test1@", Role.SELLER, "avatar.png", "avatar".getBytes());

        // Mock UserDetails
        UserInfoUserDetails userDetails = mock(UserInfoUserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        when(userService.getUserByEmail(userDetails.getUsername())).thenReturn(Optional.of(user));

        // Act
        User result = userService.authorizeUser(authentication, userId);
        assertEquals(result.getId(), userId);
        assertEquals(result.getName(), user.getName());
        assertEquals(result.getEmail(), user.getEmail());
        assertEquals(result.getPassword(), user.getPassword());
        assertEquals(result.getRole(), user.getRole());
        assertEquals(result.getAvatar(), user.getAvatar());
        assertEquals(result.getAvatarData(), user.getAvatarData());
    }

    @Test
    void authorizeUserWhenNotFound_thenThrowEx() {
        // Create a sample User id
        String userId = "user-id1";

        when(userService.findUserById(userId)).thenReturn(false);

        Throwable exception = assertThrows(NoSuchElementException.class, () -> {
            userService.authorizeUser(authentication, userId);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void authorizeUserWhenSomeoneElse_thenThrowEx() {
        // Create a sample User id
        String userId = "user-id1";

        when(userService.findUserById(userId)).thenReturn(true);

        User user = new User("user-id2", "Test Name", "test@mail.com",
                "Test1@", Role.SELLER, "avatar.png", "avatar".getBytes());

        // Mock UserDetails
        UserInfoUserDetails userDetails = mock(UserInfoUserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        when(userService.getUserByEmail(userDetails.getUsername())).thenReturn(Optional.of(user));

        Throwable exception = assertThrows(BadCredentialsException.class, () -> {
            userService.authorizeUser(authentication, userId);
        });

        assertEquals("Operation is not allowed", exception.getMessage());
    }
}
