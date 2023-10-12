package com.gritlab.controller;

import com.gritlab.model.Media;
import com.gritlab.service.MediaService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/media")
@AllArgsConstructor
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @GetMapping("product/{id}")
    public List<Media> findByProductId(@PathVariable String id) {
        return mediaService.getByProductId(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ByteArrayResource> findById(@PathVariable String id) {
        //todo send request to product mc
        Media media = mediaService.getMedia(id).orElseThrow();
        try {
            // Load the file as a byte array
            byte[] fileContent = Files.readAllBytes(Paths.get(media.getImagePath()));

            // Create a ByteArrayResource from the file content
            ByteArrayResource resource = new ByteArrayResource(fileContent);

            // Set up the HTTP headers for the response
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + media.getFileName());
            headers.setContentType(mediaService.getImageType(media.getImagePath()));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (IOException ex) {
            //todo add advice
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping()
    public ResponseEntity<Void> uploadFile(@RequestParam("file") MultipartFile file,
                             @RequestParam("productId") String  productId,
                                           UriComponentsBuilder ucb) throws IOException {

        //todo file validation
        //todo send request to product mc
        if (!file.isEmpty()) {
            String path = mediaService.saveFile(file);
            Media newProduct = mediaService.addMedia(path, productId);

            URI locationOfMedia = ucb
                    .path("/media/{id}")
                    .buildAndExpand(newProduct.getId())
                    .toUri();

            return ResponseEntity.created(locationOfMedia).build();
        } else {
            //todo refactor
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    private ResponseEntity<Void> deleteProduct(
            @PathVariable String id) {

        //todo send request to product mc
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }
}
