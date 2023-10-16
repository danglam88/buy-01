package com.gritlab.component;

import com.google.common.util.concurrent.RateLimiter;
import com.gritlab.exception.RateLimitException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiter rateLimiter = RateLimiter.create(50);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException {

            if (rateLimiter.tryAcquire()) {
                filterChain.doFilter(request, response);
            } else {
                throw new RateLimitException("Too many requests");
            }
    }
}
