package com.taskapp.backend.dto;

import com.taskapp.backend.enums.UserRole;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;

    private String email;

    private  String password;

    private UserRole userRole;

}
