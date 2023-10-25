package com.gritlab.component;

import com.gritlab.exception.UnauthorizedException;
import com.gritlab.model.UserDetails;
import com.gritlab.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.NoSuchElementException;

@Component
@Order(3)
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException, NoSuchElementException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);
                String userId = jwtService.extractUserID(token);
                String userRole = jwtService.extractUserRole(token);

                if (!jwtService.isTokenExpired(token) && username != null && userId != null && userRole != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    com.gritlab.model.UserDetails userDetails = new UserDetails(username, userId, userRole);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails,
                                    null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ex) {
                System.out.println("Failed to get data from token");
                throw new UnauthorizedException("Authorization failed");
            }
        } else {
            System.out.println("No token received");
            throw new UnauthorizedException("Authorization failed");
        }

        filterChain.doFilter(request, response);
    }
}
