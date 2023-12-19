package com.gritlab.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;

    @NotNull(message = "Name is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Name cannot be empty or contain only spaces")
    @Size(max = 50, min = 1, message = "Name cannot exceed 50 characters")
    private String name;

    @NotNull(message = "Description is required")
    @Pattern(regexp = "^(?!\\s*$).+", message = "Description cannot be empty or contain only spaces")
    @Size(max = 1000, min = 1, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Value must be greater than 0.0")
    @DecimalMax(value = "999999999.99", message = "Value must be less than or equal to 999999999.99")
    private Double price;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    @Max(value = 999999999, message = "Quantity must be less than or equal to 999999999")
    private Integer quantity;

    @JsonIgnore
    private String userId;
}
