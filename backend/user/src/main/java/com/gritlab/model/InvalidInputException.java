package com.gritlab.model;

import java.util.List;

public class InvalidInputException extends RuntimeException {

    private List<String> errors;

    public InvalidInputException(List<String> errors) {
        // This will create a message from the errors list
        super(String.join(", ", errors));
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
