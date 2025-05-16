package com.taskapp.backend.services.admin;

import com.taskapp.backend.dto.UserDto;
import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.enums.UserRole;
import org.apache.catalina.LifecycleState;
import org.apache.catalina.User;

import java.util.List;
import java.util.Map;

public interface AdminService {
    List<UserDto> getUsers();
    UserDto getUserById(Long id);
    UserDto addUser(SignupRequest signupRequest);
    UserDto updateUser(Long id, SignupRequest signupRequest);
    void deleteUser(Long id);
    UserDto updateUserRole(Long id, UserRole newRole);
    Map<String, Object> searchUsers(int page, int size, String search, UserRole role);
}
