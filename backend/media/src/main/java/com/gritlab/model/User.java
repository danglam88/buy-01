package com.gritlab.model;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Document(collection = "users")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    private String id;

    @Field("name")
    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Name cannot contain only spaces")
    @Size(min = 1, max = 50, message = "Name length must be between 1 and 50 characters")
    private String name;

    @Field("email")
    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Email cannot contain only spaces")
    @Size(max = 50, message = "Email cannot exceed 50 characters")
    @Email(message = "Email must be in valid format")
    private String email;

    @Field("password")
    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Password cannot contain only spaces")
    @Size(min = 6, max = 50, message = "Password length must be between 6 and 50 characters")
    private String password;

    @Field("role")
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Role cannot contain only spaces")
    @Pattern(regexp = "^(?i)(seller|client)$", message = "Role must be either 'SELLER' or 'CLIENT' (case-insensitive)")
    private String role;

    @Field("avatar")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Avatar cannot contain only spaces")
    @Size(max = 50, message = "Avatar cannot exceed 50 characters")
    private String avatar;
}