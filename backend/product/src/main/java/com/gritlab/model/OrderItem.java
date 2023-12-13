package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    private String itemId;

    private String sellerId;

    private String buyerId;

    private String orderId;

    private String productId;

    private String name;

    private String description;

    private Integer quantity;

    private Double itemPrice;

    private Integer maxQuantity;

    private OrderStatus statusCode;
}
