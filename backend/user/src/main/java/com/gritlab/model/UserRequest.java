package com.gritlab.model;

import com.gritlab.validator.NotDuplicatedEmail;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRequest {

    @NotNull(message = "Name is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Name cannot be empty or contain only spaces")
    @Size(min = 1, max = 50, message = "Name length must be between 1 and 50 characters")
    private String name;

    @NotNull(message = "Email is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Email cannot be empty or contain only spaces")
    @Size(max = 50, message = "Email cannot exceed 50 characters")
    @Email(message = "Email must be in valid format")
    @NotDuplicatedEmail(message = "Email already taken, please use another one")
    private String email;

    @Pattern(regexp = "^(?!\\s*$).+", message = "Password cannot be empty or contain only spaces")
    @Size(min = 6, max = 50, message = "Password length must be between 6 and 50 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, " +
                    "one digit and one special character (@$!%*?&)")
    private String password;

    @NotNull(message = "Role is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Role cannot be empty or contain only spaces")
    @Pattern(regexp = "^(?i)(seller|client)$",
            message = "Role must be either 'SELLER' or 'CLIENT' (case-insensitive)")
    private String role;
}
