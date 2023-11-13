package com.gritlab.controller;

import com.gritlab.model.Media;
import com.gritlab.model.UserDetailsJWT;
import com.gritlab.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;


@RestController
@RequestMapping("/media")
public class MediaController {

    private final MediaService mediaService;

    @Autowired
    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("product/{id}")
    public ResponseEntity<List<String>> findByProductId(@PathVariable String id) {

        return ResponseEntity.ok().body(mediaService.getByProductId(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ByteArrayResource> findById(@PathVariable String id) {

        Media media = mediaService.getMedia(id).orElseThrow();

        // Create a ByteArrayResource from the file content
        ByteArrayResource resource = new ByteArrayResource(media.getImageData());

        // Set up the HTTP headers for the response
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + media.getImagePath());
        headers.setContentType(mediaService.getImageType(media.getImagePath()));

        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

    @PostMapping()
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                             @RequestParam("productId") String  productId,
                                             Authentication authentication,
                                             UriComponentsBuilder ucb) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();
        Media newProduct = mediaService.addMedia(file, productId, userDetails.getId());

        URI locationOfMedia = ucb
                .path("/media/{id}")
                .buildAndExpand(newProduct.getId())
                .toUri();

        return ResponseEntity.created(locationOfMedia).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String id,
                                               Authentication authentication) {

        UserDetailsJWT userDetails = (UserDetailsJWT) authentication.getPrincipal();

        mediaService.deleteMedia(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
