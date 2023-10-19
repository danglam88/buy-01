package com.gritlab.service;

import com.gritlab.model.User;
import com.gritlab.model.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.NoSuchElementException;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String token) throws NoSuchElementException {
        System.out.println("loadUserByUsername: ");
        // Create HttpHeaders and add the authorization header
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);

        // Create an HttpEntity with the headers
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Make a request with RestTemplate
        //todo HttpClientErrorException$Forbidden exception with invalid token, token validation required
        ResponseEntity<User> responseEntity = restTemplate.exchange( userServiceUrl + "users/userInfo",
                HttpMethod.GET, entity, User.class);
        System.out.println("responseEntity.getStatusCode(): " + responseEntity.getStatusCode());
        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            User user = responseEntity.getBody();
            return new UserDetails(user);
        } else {
            throw new NoSuchElementException();
        }
    }
}

