package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private String orderId;

    private String userId;

    private OrderStatus statusCode;

    private Payment paymentMethodCode;

    private String zipCode;

    private String city;

    private String address;

    private String phoneNumber;
}
