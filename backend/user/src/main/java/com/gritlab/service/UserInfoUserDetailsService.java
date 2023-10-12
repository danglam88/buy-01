package com.gritlab.service;

import com.gritlab.model.User;
import com.gritlab.model.UserInfoUserDetails;
import com.gritlab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserInfoUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws BadCredentialsException {
        Optional<User> user = userRepository.findByEmail(username);
        return user.map(UserInfoUserDetails::new)
                .orElseThrow(() -> new BadCredentialsException("User with email " + username + " not found"));
    }
}
