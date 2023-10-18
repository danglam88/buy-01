package com.gritlab.advice;

import com.gritlab.model.Response;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class MaxFileSizeExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Response> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new Response("Request processing failed: Maximum upload size exceeded"));
    }
}