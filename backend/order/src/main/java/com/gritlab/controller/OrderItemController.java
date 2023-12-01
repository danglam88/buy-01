package com.gritlab.controller;

import com.gritlab.model.OrderItem;
import com.gritlab.model.OrderItemDTO;
import com.gritlab.model.OrderItemResponse;
import com.gritlab.model.UserDetailsJWT;
import com.gritlab.service.OrderItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order/item")
public class OrderItemController {

    private final OrderItemService orderItemService;

    @Autowired
    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @GetMapping
    public ResponseEntity<List<OrderItemResponse>> getOrderItems(Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        List<OrderItemResponse> items = orderItemService.getOrderItems(userDetails.getId());
        return ResponseEntity.ok().body(items);
    }

    @PostMapping
    public ResponseEntity<Void> addOrderItems(Authentication authentication,
                                                 @Valid @RequestBody OrderItemDTO data) {
        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        orderItemService.addOrderItem(userDetails.getId(), data);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateOrderItems(@PathVariable String id,
                                                    Authentication authentication,
                                                    @Valid @RequestBody OrderItemDTO data) {
        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        orderItemService.updateOrderItem(id, userDetails.getId(), data);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderItems(@PathVariable String id,
                                                            Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        orderItemService.deleteOrderItem(id, userDetails.getId());

        return ResponseEntity.ok().build();
    }
}
