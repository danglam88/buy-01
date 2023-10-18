package com.gritlab.advice;

import com.gritlab.exception.InvalidFileException;
import com.gritlab.model.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InvalidFileExceptionHandler {
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<Response> handleInvalidFileExceeded(InvalidFileException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new Response(exception.getMessage()));
    }
}
