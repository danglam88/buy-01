package com.gritlab.controller;

import com.gritlab.model.Media;
import com.gritlab.service.MediaService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;


@RestController
@RequestMapping("/media")
@AllArgsConstructor
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @GetMapping("product/{id}")
    public ResponseEntity<?> findByProductId(@PathVariable String id) {
        return ResponseEntity.ok().body(mediaService.getByProductId(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ByteArrayResource> findById(@PathVariable String id) {

        Media media = mediaService.getMedia(id).orElseThrow();

        // Create a ByteArrayResource from the file content
        ByteArrayResource resource = new ByteArrayResource(media.getImageData());

        // Set up the HTTP headers for the response
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + media.getFileName());
        headers.setContentType(mediaService.getImageType(media.getImagePath()));

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    @PostMapping()
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                             @RequestParam("productId") String  productId,
                                           UriComponentsBuilder ucb) {


        Optional<Media> newProductOptional = mediaService.addMedia(file, productId);

        if (newProductOptional.isPresent()) {
            URI locationOfMedia = ucb
                    .path("/media/{id}")
                    .buildAndExpand(newProductOptional.get().getId())
                    .toUri();

            return ResponseEntity.created(locationOfMedia).build();
        } else {
            return new ResponseEntity<>("Failed to upload image", HttpStatus.BAD_REQUEST);
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
