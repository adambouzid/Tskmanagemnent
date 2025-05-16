package com.taskapp.backend.services.auth;

import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.dto.UserDto;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.enums.UserRole;
import com.taskapp.backend.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostConstruct
    public void createAdminAccount() {
        List<User> adminUsers = userRepository.findByUserRole(UserRole.ADMIN);
        if (adminUsers.isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setUserRole(UserRole.ADMIN);
            admin.setName("Admin");
            userRepository.save(admin);
        }
    }

    @Override
    public UserDto signUser(SignupRequest signupRequest) {
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setName(signupRequest.getName());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setUserRole(UserRole.EMPLOYEE);
        User createUser = userRepository.save(user);
        return createUser.getUserDto();
    }

    @Override
    public boolean hasUserWhitEmail(String email) {
        return userRepository.findFirstByEmail(email).isPresent();
    }
}
