package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "order_item")
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

    private Integer quantity;

    private Double itemPrice;
}
