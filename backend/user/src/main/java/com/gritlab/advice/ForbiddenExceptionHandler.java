package com.gritlab.advice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gritlab.exception.ForbiddenException;
import com.gritlab.model.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ForbiddenExceptionHandler {

    @ExceptionHandler({ForbiddenException.class, JsonProcessingException.class})
    public ResponseEntity<?> handleForbiddenException(Exception ex) throws Exception {
        if (ex instanceof ForbiddenException || ex instanceof JsonProcessingException) {
            Response errorResponse = new Response(ex.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } else {
            throw ex;
        }
    }
}
