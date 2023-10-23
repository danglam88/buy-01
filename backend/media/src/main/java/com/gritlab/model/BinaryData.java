package com.gritlab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BinaryData {
    private String ownerId;
    private String path;
    private String fileContentBase64; // base64-encoded data

    public String toString() {
        return "BinaryData(ownerId=" + ownerId + ", path=" + path + ", fileContentBase64=" + fileContentBase64 + ")";
    }
}
