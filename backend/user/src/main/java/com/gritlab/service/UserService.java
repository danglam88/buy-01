package com.gritlab.service;

import com.gritlab.model.*;
import com.gritlab.repository.UserRepository;
import com.gritlab.utility.ImageFileTypeChecker;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
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

    public User createAccount(UserRequest userRequest) {
        UserDTO userDTO = this.validateInput(null, userRequest);
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

    public UserDTO validateInput(String userId, UserRequest userRequest) {
        List<String> errors = new ArrayList<>();

        if (userRequest.getName() == null) {
            errors.add("Name is required");
        } else if (userRequest.getName().trim().isEmpty()) {
            errors.add("Name cannot be empty or contain only spaces");
        } else if (userRequest.getName().replaceAll("\\s+", " ").trim().length() > 50) {
            errors.add("Name length must be between 1 and 50 characters");
        }

        if (userRequest.getEmail() == null) {
            errors.add("Email is required");
        } else if (userRequest.getEmail().trim().isEmpty()) {
            errors.add("Email cannot be empty or contain only spaces");
        } else if (userRequest.getEmail().trim().length() > 50) {
            errors.add("Email cannot exceed 50 characters");
        } else if (this.validEmail(userRequest.getEmail().trim())) {
            errors.add("Email must be in valid format");
        } else if (userRepository.findByEmail(userRequest.getEmail().trim()).isPresent() &&
            (userId == null ||
            !userRepository.findByEmail(userRequest.getEmail().trim()).get().getId().equals(userId))) {
            errors.add("Email already taken, please use another one");
        }

        if (userRequest.getPassword() == null) {
            errors.add("Password is required");
        } else if (userRequest.getPassword().trim().isEmpty()) {
            errors.add("Password cannot be empty or contain only spaces");
        } else if (userRequest.getPassword().length() < 6 || userRequest.getPassword().length() > 50) {
            errors.add("Password length must be between 6 and 50 characters");
        } else if (this.validPassword(userRequest.getPassword())) {
            errors.add("Password must contain at least one uppercase letter, one lowercase letter, "
                    + "one digit and one special character (@$!%*?&)");
        }

        if (userRequest.getRole() == null) {
            errors.add("Role is required");
        } else if (userRequest.getRole().trim().isEmpty()) {
            errors.add("Role cannot be empty or contain only spaces");
        } else if (!userRequest.getRole().trim().toUpperCase().equals("SELLER")
                && !userRequest.getRole().trim().toUpperCase().equals("CLIENT")) {
            errors.add("Role must be either 'SELLER' or 'CLIENT' (case-insensitive)");
        }

        if (userRequest.getFile() != null && !this.isFileValid(userRequest.getFile())) {
            errors.add("Avatar is invalid");
        }

        if (!errors.isEmpty()) {
            throw new InvalidInputException(errors);
        }

        try {
            return new UserDTO(null, userRequest.getName().replaceAll("\\s+", " ").trim(),
                    userRequest.getEmail().trim(), userRequest.getPassword(),
                    userRequest.getRole().trim(), userRequest.getFile().getOriginalFilename(),
                    userRequest.getFile().getBytes());
        } catch (IOException ex) {
            System.out.println(ex.getMessage());
            errors.add("Avatar is invalid");
            throw new InvalidInputException(errors);
        }
    }

    public boolean isFileValid(MultipartFile file) {
        try {
            if (!ImageFileTypeChecker.isImage(file)) {
                return false;
            }
        } catch (IOException ex) {
            //to the log
            System.out.println(ex.getMessage());
        }

        if (file.isEmpty()) {
            return false;
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!isValidExtension(extension)) {
            return false;
        }
        return true;
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

    public User updateUser(String userId, UserRequest userRequest) {
        UserDTO userDTO = this.validateInput(userId, userRequest);
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
