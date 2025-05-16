package com.taskapp.backend.dto;

import com.taskapp.backend.enums.UserRole;
import lombok.Data;

@Data
public class AuthenticationResponse {
    private String jwt;
    private Long userId;
    private UserRole userRole;

}
