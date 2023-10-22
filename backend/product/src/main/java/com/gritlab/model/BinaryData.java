package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class BinaryData {
    private String ownerId;
    private String path;
    private MultipartFile file;
}
