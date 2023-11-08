package com.gritlab.service;

import com.gritlab.exception.ForbiddenException;
import com.gritlab.exception.InvalidParamException;
import com.gritlab.model.BinaryData;
import com.gritlab.model.Media;
import com.gritlab.repository.MediaRepository;
import com.gritlab.utility.ImageFileTypeChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;


@Service
public class MediaService {

    private final String[] allowedExtensions = {"png", "gif", "jpeg", "jpg"};

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private final ProductCheckService productCheckService;

    @Autowired
    public MediaService(ProductCheckService kafkaService, MediaRepository mediaRepository) {
        this.productCheckService = kafkaService;
        this.mediaRepository = mediaRepository;
    }

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

    public Media addMedia(MultipartFile file, String productId, String userId) {

        if (!checkProduct(productId, userId)) {
            throw new ForbiddenException("Product with this id does not belong to the current user");
        }

        checkFile(file);

        Optional<List<Media>> mediaOptional = mediaRepository.findByProductId(productId);

        if (mediaOptional.isPresent() && mediaOptional.get().size() >= 5) {
            throw new InvalidParamException("Product can have at most 5 images");
        }

        try {
            byte[] imageData = file.getBytes();

            Media media = Media.builder()
                    .imageData(imageData)
                    .imagePath(file.getOriginalFilename())
                    .productId(productId)
                    .build();

            return mediaRepository.save(media);

        } catch (IOException ex) {
            throw new InvalidParamException("Failed to upload file");
        }
    }

    public void deleteMedia(String id, String userId)  {

        Media media = mediaRepository.findById(id).orElseThrow();

        if (!checkProduct(media.getProductId(), userId)) {
            throw new ForbiddenException("Media with this id does not belong to the current user");
        } else {
            Optional<List<Media>> mediaOptional = mediaRepository.findByProductId(media.getProductId());
            if (mediaOptional.isPresent() && mediaOptional.get().size() > 1) {
                mediaRepository.deleteById(id);
            } else if (mediaOptional.isPresent()) {
                throw new InvalidParamException("Product must have at least one image");
            }
        }
    }

    public boolean checkProduct(String productId, String userId) {

        String requestPayload = productId + "," + userId;

        productCheckService.sendRequest(requestPayload, requestPayload);

        try {
            String response = productCheckService.waitForResponse(requestPayload, 3000);
            if (response != null) {
                // Handle the response
                System.out.println("Received response: " + response);
                return response.equals("valid");
            } else {
                // Handle the timeout
                System.out.println("Timeout: No response received within the specified time.");
            }
        } catch (InterruptedException e) {
            // Handle exceptions
            e.printStackTrace();
        }
        return false;
    }

    @KafkaListener(topics = "DELETE_PRODUCT", groupId = "my-consumer-group")
    public void deleteProduct(String message) {
        mediaRepository.deleteAllByProductId(message);
    }

    @KafkaListener(topics = "BINARY_DATA", groupId = "binary-consumer-group", containerFactory = "binaryDataKafkaListenerContainerFactory")
    public void binaryData(BinaryData binaryData) {
        System.out.println("Received binary data: " + binaryData);
        Media media = Media.builder()
                .imageData(Base64.getDecoder().decode(binaryData.getFileContentBase64()))
                .imagePath(binaryData.getPath())
                .productId(binaryData.getOwnerId())
                .build();
        mediaRepository.save(media);
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

    public void checkFile(MultipartFile file) throws InvalidParamException {

        if (file.isEmpty()) {
            throw new InvalidParamException("File must not be empty");
        }

        try {
            if (!ImageFileTypeChecker.isImage(file)) {
                throw new InvalidParamException("File must be an image");
            }
        } catch (IOException ex) {
            throw new InvalidParamException("Failed to upload file");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new InvalidParamException("File size must be less than 2MB");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!isValidExtension(extension)) {
            throw new InvalidParamException("Allowed extensions: " + String.join(",", allowedExtensions));
        }
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
