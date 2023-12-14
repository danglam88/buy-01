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
public class OrderHistory {

    @JsonProperty("orders")
    private List<OrderResponse> orders;

    @JsonProperty("top_products")
    private List<TopProduct> topProducts;

    @JsonProperty("total_amount")
    private Double totalAmount;
}
