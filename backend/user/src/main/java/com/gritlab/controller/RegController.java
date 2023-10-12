package com.gritlab.controller;

import com.gritlab.model.RegRequest;
import com.gritlab.model.User;
import com.gritlab.service.UserService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<?> registerNewAccount(@RequestBody @Valid RegRequest regRequest,
                                                UriComponentsBuilder ucb) {
        User createdAccount = userService.createAccount(regRequest);
        URI locationOfNewUser = ucb
                .path("/users/{userId}")
                .buildAndExpand(createdAccount.getId())
                .toUri();
        return ResponseEntity.created(locationOfNewUser).build();
    }
}
