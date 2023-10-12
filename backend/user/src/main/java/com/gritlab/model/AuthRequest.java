package com.gritlab.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthRequest {

    @NotNull(message = "Email is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Email cannot be empty or contain only spaces")
    @Email(message = "Email must be in valid format")
    private String username;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Password cannot be empty or contain only spaces")
    private String password;
}
