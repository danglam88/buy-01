package com.gritlab.model;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Document(collection = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    private String id;

    @NotBlank(message = "Name is required")
    @Size(max = 50, min = 1, message = "Name cannot exceed 255 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, min = 1, message = "Description cannot exceed 255 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Value must be greater than 0.0")
    private Double price;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String userId;
}
