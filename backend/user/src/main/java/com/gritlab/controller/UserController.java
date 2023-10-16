package com.gritlab.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gritlab.model.UserRequest;
import com.gritlab.service.UserService;
import com.gritlab.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @GetMapping("/userInfo")
    public ResponseEntity<?> getUserInfo(HttpServletRequest request) throws JsonProcessingException {
        User user = userService.authenticateRequest(request, null);
        ObjectMapper objectMapper = new ObjectMapper();
        String userNoPass = objectMapper.writeValueAsString(userService.convertToDto(user));
        return ResponseEntity.status(HttpStatus.OK).body(objectMapper.readTree(userNoPass));
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(HttpServletRequest request, @PathVariable String userId)
            throws JsonProcessingException {
        User user = userService.authenticateRequest(request, userId);
        ObjectMapper objectMapper = new ObjectMapper();
        String userNoPass = objectMapper.writeValueAsString(userService.convertToDto(user));
        return ResponseEntity.status(HttpStatus.OK).body(objectMapper.readTree(userNoPass));
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            HttpServletRequest request, @PathVariable String userId,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("role") String role,
            @RequestParam("file") MultipartFile file, UriComponentsBuilder ucb) {
        userService.authenticateRequest(request, userId);
        UserRequest userRequest = new UserRequest(name, email, password, role, file);
        User updatedUser = userService.updateUser(userId, userRequest);
        URI locationOfUpdatedUser = ucb
                .path("/users/{userId}")
                .buildAndExpand(updatedUser.getId())
                .toUri();
        return ResponseEntity.ok().location(locationOfUpdatedUser).build();
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(HttpServletRequest request, @PathVariable String userId) {
        userService.authenticateRequest(request, userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
