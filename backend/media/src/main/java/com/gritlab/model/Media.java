package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "media")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Media {
    @Id
    private String id;

    private String imagePath;

    private String productId;

    private byte[] imageData;
}
