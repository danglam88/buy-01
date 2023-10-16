package com.gritlab.advice;

import com.gritlab.exception.InvalidFileException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InvalidFileExceptionHandler {
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<String> handleInvalidFileExceeded(InvalidFileException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(exception.getMessage());
    }
}
