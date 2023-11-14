package com.gritlab.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gritlab.model.Product;
import com.gritlab.model.ProductDTO;
import com.gritlab.model.UserDetailsJWT;
import com.gritlab.service.ProductService;
import jakarta.validation.Valid;
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
public class ProductController {

    private ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping()
    public ResponseEntity<JsonNode> findAll() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        String productsNoUserId = objectMapper.writeValueAsString(productService.findAll());
        return ResponseEntity.ok(objectMapper.readTree(productsNoUserId));
    }

    @GetMapping("/seller")
    public ResponseEntity<JsonNode> findBySellerId(Authentication authentication) throws JsonProcessingException {
        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        ObjectMapper objectMapper = new ObjectMapper();
        String productsNoUserId = objectMapper.writeValueAsString(productService.findBySellerId(userDetails.getId()));
        return ResponseEntity.ok(objectMapper.readTree(productsNoUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JsonNode> findById(@PathVariable String id) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        Product product = productService.getProduct(id).orElseThrow();
        String productNoUserId = objectMapper.writeValueAsString(product);
        return ResponseEntity.ok(objectMapper.readTree(productNoUserId));
    }

    @PostMapping
    public ResponseEntity<String> createProduct(@Valid @ModelAttribute("request") ProductDTO request,
                                                BindingResult result,
                                                @RequestPart("files") List<MultipartFile> files,
                                                Authentication authentication,
                                                UriComponentsBuilder ucb) throws MethodArgumentNotValidException {
        if (result.hasErrors()) {
            throw new MethodArgumentNotValidException((MethodParameter) null, result);
        }

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        Product newProduct = productService.addProduct(request, files, userDetails.getId());

        URI locationOfNewProduct = ucb
                .path("/products/{id}")
                .buildAndExpand(newProduct.getId())
                .toUri();

        return ResponseEntity.created(locationOfNewProduct).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductDTO updatedData,
            Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        productService.updateProduct(id, updatedData, userDetails.getId());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable String id,
            Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        productService.deleteProduct(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
