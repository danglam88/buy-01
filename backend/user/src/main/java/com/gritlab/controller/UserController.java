package com.gritlab.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gritlab.model.UserRequest;
import com.gritlab.service.UserService;
import com.gritlab.model.User;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
    public ResponseEntity<JsonNode> getUserInfo(Authentication authentication) throws JsonProcessingException {
        User user = userService.authorizeUser(authentication, null, true);
        ObjectMapper objectMapper = new ObjectMapper();
        String userNoPass = objectMapper.writeValueAsString(userService.convertToDto(user));
        return ResponseEntity.status(HttpStatus.OK).body(objectMapper.readTree(userNoPass));
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @GetMapping("/avatar/{userId}")
    public ResponseEntity<ByteArrayResource> getAvatarById(@PathVariable String userId, Authentication authentication) {
        User user = userService.authorizeUser(authentication, userId, true);

        // Create a ByteArrayResource from the file content
        ByteArrayResource resource = new ByteArrayResource(user.getAvatarData());

        // Set up the HTTP headers for the response
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + user.getAvatar());
        headers.setContentType(userService.getImageType(user.getAvatar()));

        return ResponseEntity.ok().headers(headers).body(resource);
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @GetMapping("/{userId}")
    public ResponseEntity<JsonNode> getUserById(@PathVariable String userId, Authentication authentication)
            throws JsonProcessingException {
        User user = userService.authorizeUser(authentication, userId, false);
        ObjectMapper objectMapper = new ObjectMapper();
        String userNoPass = objectMapper.writeValueAsString(userService.convertToDto(user));
        return ResponseEntity.status(HttpStatus.OK).body(objectMapper.readTree(userNoPass));
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(@PathVariable String userId,
            @Valid @ModelAttribute("request") UserRequest request,
            BindingResult result,
            @RequestPart(value = "file", required = false) MultipartFile file,
            UriComponentsBuilder ucb, Authentication authentication) throws MethodArgumentNotValidException {

        if (result.hasErrors()) {
            throw new MethodArgumentNotValidException((MethodParameter) null, result);
        }

        userService.authorizeUser(authentication, userId, true);
        User updatedUser = userService.updateUser(userId, request, file);
        URI locationOfUpdatedUser = ucb
                .path("/users/{userId}")
                .buildAndExpand(updatedUser.getId())
                .toUri();
        return ResponseEntity.ok().location(locationOfUpdatedUser).build();
    }

    @PreAuthorize("hasAnyAuthority('SELLER', 'CLIENT')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId, Authentication authentication) {
        userService.authorizeUser(authentication, userId, true);
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
