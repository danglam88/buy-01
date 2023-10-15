package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper=false)
public class ProductResponse extends Product {

    private List<String> images;

    public ProductResponse(Product product) {
        super(product.getId(), product.getName(), product.getDescription(), product.getPrice(), product.getQuantity(), product.getUserId());
    }

    public void setImages(List<String> media, String service) {
        this.images = new ArrayList<>();
        for (String item : media) {
            this.images.add(service + item);
        }
    }
}
