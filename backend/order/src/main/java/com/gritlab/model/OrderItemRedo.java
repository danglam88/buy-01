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
public class OrderItemRedo {

    @Id
    private String itemId;

    private String orderId;

    private String productId;

    private Integer quantity;
}
