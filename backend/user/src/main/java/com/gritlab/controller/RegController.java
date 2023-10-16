package com.gritlab.controller;

import com.gritlab.model.UserRequest;
import com.gritlab.model.User;
import com.gritlab.service.UserService;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/reg")
@AllArgsConstructor
public class RegController {

    @Autowired
    private UserService userService;

    @PermitAll
    @PostMapping
    public ResponseEntity<?> registerNewAccount(@RequestParam("name") String name,
                                                @RequestParam("email") String email,
                                                @RequestParam("password") String password,
                                                @RequestParam("role") String role,
                                                @RequestParam("file") MultipartFile file,
                                                UriComponentsBuilder ucb) {
        UserRequest userRequest = new UserRequest(name, email, password, role, file);
        User createdAccount = userService.createAccount(userRequest);
        URI locationOfNewUser = ucb
                .path("/users/{userId}")
                .buildAndExpand(createdAccount.getId())
                .toUri();
        return ResponseEntity.created(locationOfNewUser).build();
    }
}
