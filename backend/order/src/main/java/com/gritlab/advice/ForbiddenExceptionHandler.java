package com.gritlab.advice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gritlab.exception.ForbiddenException;
import com.gritlab.model.Response;
import org.apache.kafka.common.errors.SerializationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;

@ControllerAdvice
public class ForbiddenExceptionHandler {

    @ExceptionHandler({ForbiddenException.class, JsonProcessingException.class, IOException.class, SerializationException.class})
    public ResponseEntity<Response> handleForbiddenException(Exception ex) throws Exception {
        if (ex instanceof ForbiddenException || ex instanceof IOException || ex instanceof SerializationException) {
            Response errorResponse = new Response(ex.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        } else {
            throw ex;
        }
    }
}