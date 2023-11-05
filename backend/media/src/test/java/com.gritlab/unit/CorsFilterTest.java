package com.gritlab.unit;

import com.gritlab.component.CorsFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@SpringBootTest
public class CorsFilterTest {

    @Autowired
    private CorsFilter corsFilter;

    @MockBean
    private HttpServletRequest request;

    @MockBean
    private HttpServletResponse response;

    @MockBean
    private FilterChain filterChain;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Test
    public void testDoFilterInternal() throws IOException, ServletException {
        when(request.getHeader("Origin")).thenReturn(frontendUrl);

        corsFilter.doFilter(request, response, filterChain);

        // Verify that the filter sets the expected response headers.
        verify(response).setHeader("Access-Control-Allow-Origin", frontendUrl);
        verify(response).setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
        verify(response).setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        verify(response).setHeader("Access-Control-Allow-Credentials", "true");

        // Verify that the filter chain is called.
        verify(filterChain).doFilter(request, response);
    }
}

