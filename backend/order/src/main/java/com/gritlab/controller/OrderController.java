package com.gritlab.controller;

import com.gritlab.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/seller")
    public ResponseEntity<Void> getSellerOrders() {

        return ResponseEntity.ok().build();
    }

    @GetMapping("/client")
    public ResponseEntity<Void> getClientOrders() {

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Void> getOrder(@PathVariable String id) {

        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Void> createOrder() {

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateOrder(@PathVariable String id) {

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {

        return ResponseEntity.ok().build();
    }
}
