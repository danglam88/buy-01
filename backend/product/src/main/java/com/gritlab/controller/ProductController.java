package com.gritlab.controller;

import com.gritlab.model.Product;
import com.gritlab.model.ProductResponse;
import com.gritlab.model.UserDetails;
import com.gritlab.service.ProductService;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.core.Authentication;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/products")
@AllArgsConstructor
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping()
    public ResponseEntity<List<Product>> findAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/seller")
    public ResponseEntity<List<Product>> findBySellerId(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(productService.findBySellerId(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable String id) {
        Product product = productService.getProduct(id).orElseThrow();
        return ResponseEntity.ok(product);
    }

    @PostMapping
    private ResponseEntity<String> createProduct(@Valid @RequestBody Product request,
                                                Authentication authentication,
                                                UriComponentsBuilder ucb) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Product newProduct = productService.addProduct(request.getName(),
                request.getDescription(),request.getPrice(),request.getQuantity(), userDetails.getId());

        URI locationOfNewProduct = ucb
                .path("/products/{id}")
                .buildAndExpand(newProduct.getId())
                .toUri();

        return ResponseEntity.created(locationOfNewProduct).body(newProduct.getId());
    }

    @PutMapping("/{id}")
    private ResponseEntity<Void> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody Product updatedData,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        productService.updateProduct(id, updatedData, userDetails.getId());

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        productService.deleteProduct(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
