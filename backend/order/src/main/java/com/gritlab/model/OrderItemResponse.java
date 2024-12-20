package com.gritlab.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("item_id")
    private String itemId;

    @JsonProperty("product_id")
    private String productId;

    @JsonProperty("buyer_id")
    private String buyerId;

    @JsonProperty("seller_id")
    private String sellerId;

    private String name;

    private String description;

    private Integer quantity;

    @JsonProperty("item_price")
    private Double itemPrice;

    @JsonProperty("status_code")
    private OrderStatus statusCode;

    public static OrderItemResponse fromOrderItem(OrderItem item) {

        return OrderItemResponse.builder()
                .orderId(item.getOrderId())
                .itemId(item.getItemId())
                .productId(item.getProductId())
                .buyerId(item.getBuyerId())
                .sellerId(item.getSellerId())
                .name(item.getName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .itemPrice(item.getItemPrice())
                .statusCode(item.getStatusCode())
                .build();
    }
}
