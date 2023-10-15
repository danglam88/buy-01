package com.gritlab.service;

import com.gritlab.model.Media;
import com.gritlab.repository.MediaRepository;
import com.gritlab.utility.ImageFileTypeChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@Service
public class MediaService {

    private final String[] allowedExtensions = {"png", "gif", "jpeg", "jpg"};

    @Autowired
    private MediaRepository mediaRepository;

    public Optional<Media> getMedia(String id) {

        return mediaRepository.findById(id);
    }

    public List<String> getByProductId(String id) {

        List<String> productImages = new ArrayList<>();
        Optional<List<Media>> mediaOptional = mediaRepository.findByProductId(id);

        if (mediaOptional.isPresent() && !mediaOptional.get().isEmpty()) {
            List<Media> media = mediaOptional.get();
            for (Media item : media) {
                productImages.add(item.getId());
            }
        }

        return productImages;
    }

    public Optional<Media> addMedia(MultipartFile file, String productId) {

        Optional<Media> newMedia = Optional.empty();
        if (isFileValid(file)) {
            try {
                byte[] imageData = file.getBytes();

                Media media = Media.builder()
                        .imageData(imageData)
                        .imagePath(file.getOriginalFilename())
                        .productId(productId)
                        .build();

                newMedia = Optional.of(mediaRepository.save(media));
            } catch (IOException ex) {
                //to log file
                System.out.println(ex.getMessage());
            }
        }

        return newMedia;
    }

    public void deleteMedia(String id)  {

        if (mediaRepository.existsById(id)) {

            Media media = mediaRepository.findById(id).orElseThrow();

            File fileToDelete = new File(media.getImagePath());

            if (fileToDelete.delete()) {
                System.out.println("File deleted successfully.");
            } else {
                System.err.println("Failed to delete the file.");
            }
            mediaRepository.deleteById(id);
        }
    }

    @KafkaListener(topics = "DELETE_PRODUCT", groupId = "my-consumer-group")
    public void consumeMessage(String message) {
        mediaRepository.deleteAllByProductId(message);
    }

    @KafkaListener(topics = "DEFAULT_PRODUCT", groupId = "my-consumer-group")
    public void consumeMessage2(String message) throws IOException {
        String productId = message.split(" ")[0];
        String fileName = message.split(" ")[1];
        Path filePath = Paths.get("media/upload/" + fileName);
        try {
            byte[] fileContent = Files.readAllBytes(filePath);
            Media media = Media.builder()
                    .imageData(fileContent)
                    .imagePath(fileName)
                    .productId(productId)
                    .build();
            mediaRepository.save(media);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public MediaType getImageType(String fileName) {

        String extension = getExtension(fileName);

        // Map the file extension to image types
        return switch (extension) {
            case "png" -> MediaType.IMAGE_PNG;
            case "gif" -> MediaType.IMAGE_GIF;
            default -> MediaType.IMAGE_JPEG;
        };
    }

    public boolean isFileValid(MultipartFile file) {

        try {
            if (!ImageFileTypeChecker.isImage(file)) {
                return false;
            }
        } catch (IOException ex) {
            //to the log
            System.out.println(ex.getMessage());
        }

        if (file.isEmpty()) {
            return false;
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!isValidExtension(extension)) {
            return false;
        }
        return true;
    }

    public String getExtension(String fileName) {

        String extension = "";

        if (fileName != null && !fileName.isEmpty()) {
            int lastDotIndex = fileName.lastIndexOf(".");

            if (lastDotIndex > 0) {
                extension = fileName.substring(lastDotIndex + 1).toLowerCase();
            }
        }
        return extension;
    }

    private boolean isValidExtension(String extension) {
        for (String allowedExtension : allowedExtensions) {
            if (allowedExtension.equals(extension)) {
                return true;
            }
        }
        return false;
    }
}
