package com.gritlab.service;

import com.gritlab.model.*;
import com.gritlab.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public User convertFromDto(UserDTO userDTO) {
        User user = new User(userDTO.getId(), userDTO.getName(),
                userDTO.getEmail(), userDTO.getPassword(), null, userDTO.getAvatar());
        if (userDTO.getRole() != null) {
            user.setRole(Role.valueOf(userDTO.getRole()));
        }
        return user;
    }

    public UserDTO convertToDto(User user) {
        UserDTO userDTO = new UserDTO(user.getId(), user.getName(),
                user.getEmail(), user.getPassword(), null, user.getAvatar());
        if (user.getRole() != null) {
            userDTO.setRole(user.getRole().toString());
        }
        return userDTO;
    }

    public List<UserDTO> convertToDtos(List<User> users) {
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createAccount(RegRequest regRequest) {
        UserDTO userDTO = new UserDTO(null, regRequest.getName(),
                regRequest.getEmail(), regRequest.getPassword(), regRequest.getRole(), regRequest.getAvatar());
        String userId;
        do {
            userId = UUID.randomUUID().toString().split("-")[0];
        } while (userRepository.existsById(userId));
        String hashedPassword = passwordEncoder.encode(userDTO.getPassword() + userId);
        userDTO = UserDTO.builder()
                .id(userId)
                .name(userDTO.getName().trim().replaceAll("\\s+", " "))
                .email(userDTO.getEmail().trim())
                .password(hashedPassword)
                .role(userDTO.getRole().trim().toUpperCase())
                .avatar(userDTO.getAvatar())
                .build();
        return userRepository.save(convertFromDto(userDTO));
    }

    public List<UserDTO> getAllUserDTOs() {
        return convertToDtos(userRepository.findAll());
    }

    public boolean findUserById(String userId) {
        return userRepository.existsById(userId);
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User updateUser(String userId, UserRequest userRequest) {
        UserDTO userDTO = new UserDTO(null, userRequest.getName(),
                userRequest.getEmail(), userRequest.getPassword(), userRequest.getRole(), userRequest.getAvatar());
        Optional<User> user = userRepository.findById(userId);
        String hashedPassword = null;
        if (userDTO.getPassword() != null) {
            hashedPassword = passwordEncoder.encode(userDTO.getPassword() + userId);
        } else if (user.isPresent()) {
            hashedPassword = user.get().getPassword();
        }
        userDTO = UserDTO.builder()
                .id(userId)
                .name(userDTO.getName().trim().replaceAll("\\s+", " "))
                .email(userDTO.getEmail().trim())
                .password(hashedPassword)
                .role(userDTO.getRole().trim().toUpperCase())
                .avatar(userDTO.getAvatar())
                .build();
        return userRepository.save(convertFromDto(userDTO));
    }

    public void deleteUser(String userId) {
        kafkaTemplate.send("DELETE_USER", userId);
        userRepository.deleteById(userId);
    }

    public User authenticateRequest(HttpServletRequest request, String userId)
            throws BadCredentialsException, NoSuchElementException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadCredentialsException("User cannot be authenticated");
        }
        if (userId != null && !findUserById(userId)) {
            throw new NoSuchElementException();
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Optional<User> user = getUserByEmail(username);
        if (user.isEmpty() || (userId != null && !user.get().getId().equals(userId))) {
            throw new BadCredentialsException("Operation is not allowed");
        }
        return user.get();
    }
}
