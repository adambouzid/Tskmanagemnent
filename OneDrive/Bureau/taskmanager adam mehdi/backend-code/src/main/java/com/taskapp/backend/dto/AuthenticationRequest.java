package com.taskapp.backend.dto;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private  String email;
    private String password;

}
