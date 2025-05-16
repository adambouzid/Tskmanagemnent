package com.taskapp.backend.services.jwt;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {

   UserDetailsService userDetailService();

}
