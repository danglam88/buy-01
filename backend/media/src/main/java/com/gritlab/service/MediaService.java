package com.gritlab.service;

import com.gritlab.model.Media;
import com.gritlab.repository.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;


@Service
public class MediaService {

    @Autowired
    private MediaRepository mediaRepository;

    public Optional<Media> getMedia(String id) {

        return mediaRepository.findById(id);
    }

    public List<Media> getByProductId(String id) {

        return mediaRepository.findByProductId(id).orElseThrow();
    }

    public Media addMedia(String imagePath, String productId) {

        var product = Media.builder()
                .imagePath(imagePath)
                .productId(productId)
                .build();

        return mediaRepository.save(product);
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

    //todo also need to delete files!
    @KafkaListener(topics = "DELETE_PRODUCT", groupId = "my-consumer-group")
    public void consumeMessage(String message) {
        mediaRepository.deleteAllByProductId(message);
    }

    @KafkaListener(topics = "DEFAULT_PRODUCT", groupId = "my-consumer-group")
    public void consumeMessage2(String message) {
        String productId = message.split(" ")[0];
        String imagePath = message.split(" ")[1];
        this.addMedia(imagePath, productId);
    }
    public String saveFile(MultipartFile file) throws IOException {

        File folder = new File("upload");
        if (!folder.exists()) {
            if (folder.mkdirs()) {
                System.out.println("Folder created successfully.");
            } else {
                System.out.println("Folder not created successfully.");
            }
        }

        String path = folder.getAbsolutePath() + File.separator + file.getOriginalFilename();
        // Create a File object with the desired file path
        //todo add check to avoid collisions, maybe rename?
        File targetFile = new File(path);

        // Save the file to the specified directory
        file.transferTo(targetFile);

        return path;
    }

    public MediaType getImageType(String fileName) {
        if (fileName != null && !fileName.isEmpty()) {
            // Get the file extension by finding the last dot in the file name
            int lastDotIndex = fileName.lastIndexOf(".");

            if (lastDotIndex > 0) {
                String extension = fileName.substring(lastDotIndex + 1).toLowerCase();

                // Map the file extension to image types
                return switch (extension) {
                    case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
                    case "png" -> MediaType.IMAGE_PNG;
                    case "gif" -> MediaType.IMAGE_GIF;
                    //todo throw an error?
                    default -> MediaType.IMAGE_JPEG;
                };
            }
        }

        return MediaType.IMAGE_JPEG;
    }


    /*private String getExtension(String fileName) {

        // Find the last dot in the file name
        int lastDotIndex = fileName.lastIndexOf(".");

        // Check if a dot was found and get the extension
        if (lastDotIndex > 0) {
            return fileName.substring(lastDotIndex + 1);
        } else {
            //todo maybe throw ex
            return "";
        }
    }*/
}
