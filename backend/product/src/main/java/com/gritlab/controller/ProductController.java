package com.gritlab.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.Product;
import com.gritlab.model.UserDetails;
import com.gritlab.service.ProductService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
    public ResponseEntity<?> findAll() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        String productsNoUserId = objectMapper.writeValueAsString(productService.findAll());
        return ResponseEntity.ok(objectMapper.readTree(productsNoUserId));
    }

    @GetMapping("/seller")
    public ResponseEntity<?> findBySellerId(Authentication authentication) throws JsonProcessingException {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        ObjectMapper objectMapper = new ObjectMapper();
        String productsNoUserId = objectMapper.writeValueAsString(productService.findBySellerId(userDetails.getId()));
        return ResponseEntity.ok(objectMapper.readTree(productsNoUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable String id) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = productService.getProduct(id).orElseThrow();
        String productNoUserId = objectMapper.writeValueAsString(product);
        return ResponseEntity.ok(objectMapper.readTree(productNoUserId));
    }

    @PostMapping
    public ResponseEntity<String> createProduct(@Valid @ModelAttribute("request") Product request,
                                                BindingResult result,
                                                @RequestPart("files") List<MultipartFile> files,
                                                Authentication authentication,
                                                UriComponentsBuilder ucb) throws MethodArgumentNotValidException {
        if (result.hasErrors()) {
            throw new MethodArgumentNotValidException((MethodParameter) null, result);
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Product newProduct = productService.addProduct(request, files, userDetails.getId());

        URI locationOfNewProduct = ucb
                .path("/products/{id}")
                .buildAndExpand(newProduct.getId())
                .toUri();

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody Product updatedData,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        productService.updateProduct(id, updatedData, userDetails.getId());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            Authentication authentication) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        productService.deleteProduct(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
