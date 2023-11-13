package com.gritlab.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.List;
import java.util.Collection;

public class UserInfoUserDetails implements UserDetails {

    private String username;

    private String id;

    private String password;

    private List<GrantedAuthority> authorities;

    public UserInfoUserDetails(User user) {
        this.username = user.getEmail();
        this.password = user.getPassword();
        this.authorities = Arrays.stream(user.getRole().toString().split(","))
                .map(roleStr -> (GrantedAuthority) new SimpleGrantedAuthority(roleStr))
                .toList();
    }

    public UserInfoUserDetails(String username, String id, String role) {
        this.username = username;
        this.id = id;
        this.authorities = Arrays.stream(role.split(","))
                .map(roleStr -> (GrantedAuthority) new SimpleGrantedAuthority(roleStr))
                .toList();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    public String getId() {return this.id; }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
