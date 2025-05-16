package com.taskapp.backend.services.auth;

import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.dto.UserDto;

public interface AuthService {
   UserDto signUser(SignupRequest signupRequest);
   boolean hasUserWhitEmail(String email);
}
