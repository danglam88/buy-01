package com.gritlab.advice;

import com.gritlab.exception.InvalidParamException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class InvalidParamExceptionHandler {

    @ExceptionHandler(InvalidParamException.class)
    public ResponseEntity<String> handleInvalidFileExceeded(InvalidParamException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(exception.getMessage());
    }
}
