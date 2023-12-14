package com.gritlab.controller;

import com.gritlab.model.*;
import com.gritlab.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/seller")
    public ResponseEntity<OrderItemHistory> getSellerOrderItems(Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        OrderItemHistory items = orderService.getOrderItemsBySellerId(userDetails.getId());
        return ResponseEntity.ok().body(items);
    }

    @GetMapping("/client")
    public ResponseEntity<OrderHistory> getClientOrders(Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        OrderHistory orders = orderService.getOrdersByBuyerId(userDetails.getId());
        return ResponseEntity.ok().body(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String id, Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        OrderResponse order = orderService.getOrderByOrderIdAndBuyerId(id, userDetails.getId());
        return ResponseEntity.ok().body(order);
    }

    @PostMapping
    public ResponseEntity<String> createOrder(Authentication authentication, @Valid @RequestBody OrderRequest data) {
        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        String orderId = orderService.addOrder(userDetails.getId(), data);
        return ResponseEntity.ok().body(orderId);
    }

    @PostMapping("/redo")
    public ResponseEntity<List<String>> redoOrder(Authentication authentication, @Valid @RequestBody String orderId) {
        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        List<String> itemIds = orderService.redoOrder(orderId, userDetails.getId());
        return ResponseEntity.ok().body(itemIds);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateOrder(@PathVariable String id,
                                            Authentication authentication,
                                            @Valid @RequestBody OrderRequest data) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        orderService.updateOrder(id, userDetails.getId(), data);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id, Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        orderService.deleteOrder(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
