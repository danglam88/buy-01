package com.gritlab.controller;

import com.gritlab.model.AuthRequest;
import com.gritlab.model.AuthResponse;
import com.gritlab.model.User;
import com.gritlab.repository.UserRepository;
import com.gritlab.service.JwtService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @PermitAll
    @PostMapping
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody @Valid AuthRequest authRequest)
            throws BadCredentialsException {

            Optional<User> user = userRepository.findByEmail(authRequest.getUsername().toLowerCase());
            if (user.isPresent()) {
                Authentication authentication = authenticationManager
                        .authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername().toLowerCase(),
                                authRequest.getPassword() + user.get().getId()));
                if (authentication.isAuthenticated()) {
                    AuthResponse authResponse =
                            new AuthResponse(jwtService.generateToken(authRequest.getUsername().toLowerCase()),
                            user.get().getId(), user.get().getRole().toString());
                    return ResponseEntity.status(HttpStatus.OK).body(authResponse);
                }
            }
            throw new BadCredentialsException("User cannot be authenticated");
    }
}
