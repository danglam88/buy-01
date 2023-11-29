package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private String itemId;

    private String orderId;

    private ProductDTO product;

    private Integer quantity;

    private Double itemPrice;
}
