package com.gritlab.utility;

import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public class ImageFileTypeChecker {

    public static boolean isImage(MultipartFile file) throws IOException {
        Tika tika = new Tika();
        String detectedType = tika.detect(file.getInputStream());

        // Check if the detected MIME type starts with "image/"
        return detectedType.startsWith("image/");
    }
}
