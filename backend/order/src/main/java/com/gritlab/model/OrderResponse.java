package com.gritlab.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("status_code")
    private OrderStatus statusCode;

    private List<OrderItemResponse> items;

    @JsonProperty("payment_code")
    private Payment paymentCode;
}
