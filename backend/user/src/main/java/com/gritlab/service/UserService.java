package com.gritlab.service;

import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.*;
import com.gritlab.repository.UserRepository;
import com.gritlab.utility.ImageFileTypeChecker;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Validated
public class UserService {

    private final String[] allowedExtensions = {"png", "gif", "jpeg", "jpg"};

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public User convertFromDto(UserDTO userDTO) {
        User user = new User(userDTO.getId(), userDTO.getName(), userDTO.getEmail(),
                userDTO.getPassword(), null, userDTO.getAvatar(), userDTO.getAvatarData());
        if (userDTO.getRole() != null) {
            user.setRole(Role.valueOf(userDTO.getRole()));
        }
        return user;
    }

    public UserDTO convertToDto(User user) {
        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getEmail(),
                user.getPassword(), null, user.getAvatar(), user.getAvatarData());
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

    public User createAccount(RegRequest regRequest, MultipartFile file) {
        UserDTO userDTO = this.validateRegFile(regRequest, file);
        String userId;
        do {
            userId = UUID.randomUUID().toString().split("-")[0];
        } while (userRepository.existsById(userId));
        String hashedPassword = passwordEncoder.encode(userDTO.getPassword() + userId);
        userDTO = UserDTO.builder()
                .id(userId)
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(hashedPassword)
                .role(userDTO.getRole())
                .avatar(userDTO.getAvatar())
                .avatarData(userDTO.getAvatarData())
                .build();
        return userRepository.save(convertFromDto(userDTO));
    }

    public UserDTO validateRegFile(RegRequest regRequest, MultipartFile file) {

        if (file == null) {
            return new UserDTO(null, regRequest.getName().replaceAll("\\s+", " ").trim(),
                    regRequest.getEmail().trim().toLowerCase(), regRequest.getPassword(),
                    regRequest.getRole().trim().toUpperCase(), null, null);
        }

        checkFile(file);

        try {
            return new UserDTO(null, regRequest.getName().replaceAll("\\s+", " ").trim(),
                    regRequest.getEmail().trim().toLowerCase(), regRequest.getPassword(),
                    regRequest.getRole().trim().toUpperCase(), file.getOriginalFilename(), file.getBytes());
        } catch (IOException ex) {
            System.out.println(ex.getMessage());
            throw new InvalidParamException("Failed to upload file");
        }
    }

    public UserDTO validateUserFile(UserRequest userRequest, MultipartFile file) {

        if (file == null) {
            return new UserDTO(null, userRequest.getName().replaceAll("\\s+", " ").trim(),
                    userRequest.getEmail().trim().toLowerCase(), userRequest.getPassword(),
                    userRequest.getRole().trim().toUpperCase(), null, null);
        }

        checkFile(file);

        try {
            return new UserDTO(null, userRequest.getName().replaceAll("\\s+", " ").trim(),
                    userRequest.getEmail().trim().toLowerCase(), userRequest.getPassword(),
                    userRequest.getRole().trim().toUpperCase(), file.getOriginalFilename(), file.getBytes());
        } catch (IOException ex) {
            System.out.println(ex.getMessage());
            throw new InvalidParamException("Failed to upload file");
        }
    }

    public void checkFile(MultipartFile file) throws InvalidParamException {

        if (file.isEmpty()) {
            throw new InvalidParamException("File must not be empty");
        }

        try {
            if (!ImageFileTypeChecker.isImage(file)) {
                throw new InvalidParamException("File must be image");
            }
        } catch (IOException ex) {
            throw new InvalidParamException("Failed to upload file");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new InvalidParamException("File size must be less than 2MB");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!isValidExtension(extension)) {
            throw new InvalidParamException("Allowed extensions: " + String.join(",", allowedExtensions));
        }
    }

    public MediaType getImageType(String fileName) {

        String extension = getExtension(fileName);

        // Map the file extension to image types
        return switch (extension) {
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.IMAGE_GIF;
            default -> MediaType.IMAGE_JPEG;
        };
    }

    public String getExtension(String fileName) {

        String extension = "";

        if (fileName != null && !fileName.isEmpty()) {
            int lastDotIndex = fileName.lastIndexOf(".");

            if (lastDotIndex > 0) {
                extension = fileName.substring(lastDotIndex + 1).toLowerCase();
            }
        }
        return extension;
    }

    private boolean isValidExtension(String extension) {
        for (String allowedExtension : allowedExtensions) {
            if (allowedExtension.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    public boolean validEmail(String email) {
        return !email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    public boolean validPassword(String password) {
        return !password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$");
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

    public User updateUser(String userId, UserRequest userRequest, MultipartFile file) {
        UserDTO userDTO = this.validateUserFile(userRequest, file);
        Optional<User> user = userRepository.findById(userId);
        String hashedPassword = null;
        if (userDTO.getPassword() != null) {
            hashedPassword = passwordEncoder.encode(userDTO.getPassword() + userId);
        } else if (user.isPresent()) {
            hashedPassword = user.get().getPassword();
        }
        userDTO = UserDTO.builder()
                .id(userId)
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(hashedPassword)
                .role(userDTO.getRole())
                .avatar(userDTO.getAvatar())
                .avatarData(userDTO.getAvatarData())
                .build();
        return userRepository.save(convertFromDto(userDTO));
    }

    public void deleteUser(String userId) {
        kafkaTemplate.send("DELETE_USER", userId);
        userRepository.deleteById(userId);
    }

    public User authorizeUser(Authentication authentication, String userId) {
        if (userId != null && !this.findUserById(userId)) {
            throw new NoSuchElementException("User not found");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Optional<User> user = getUserByEmail(userDetails.getUsername());
        if (user.isEmpty() || (userId != null && !user.get().getId().equals(userId))) {
            throw new BadCredentialsException("Operation is not allowed");
        }
        return user.get();
    }
}
