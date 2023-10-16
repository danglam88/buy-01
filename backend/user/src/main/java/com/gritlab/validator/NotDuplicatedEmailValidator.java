package com.gritlab.validator;

import com.gritlab.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class NotDuplicatedEmailValidator implements ConstraintValidator<NotDuplicatedEmail, String> {

    @Autowired
    private UserService userService;

    @Override
    public void initialize(NotDuplicatedEmail constraintAnnotation) {
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.isEmpty()) {
            return true;
        }
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return true;
            }
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            if (email.equals(username)) {
                return true;
            }
            return !userService.emailExists(email.toLowerCase());
        } catch (Exception e) {
            return !userService.emailExists(email.toLowerCase());
        }
    }
}
