package com.gritlab.model;

public class RateLimitException extends RuntimeException{

    public RateLimitException(String message) {
        super(message);
    }
}
