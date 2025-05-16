package com.taskapp.backend.services.admin;

import com.taskapp.backend.dto.UserDto;
import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.enums.UserRole;
import com.taskapp.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor

public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Nouvelle méthode pour la recherche paginée
    public Map<String, Object> searchUsers(int page, int size, String search, UserRole role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findFirstByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Pageable pageable = PageRequest.of(page, size);
        String searchQuery = (search == null || search.isEmpty()) ? "" : search;
        UserRole effectiveRole = (currentUser.getId() == 1) ? role : UserRole.EMPLOYEE;
        Page<User> userPage = userRepository.searchUsers(searchQuery, effectiveRole, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("content", userPage.getContent().stream().map(User::getUserDto).collect(Collectors.toList()));
        result.put("page", userPage.getNumber());
        result.put("size", userPage.getSize());
        result.put("totalElements", userPage.getTotalElements());
        result.put("totalPages", userPage.getTotalPages());
        return result;
    }

    @Override
    public List<UserDto> getUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findFirstByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Only admin with ID 1 (super admin) can see all users
        if (currentUser.getId() == 1) {
            return userRepository.findAll()
                    .stream()
                    .map(User::getUserDto)
                    .collect(Collectors.toList());
        } else {
            // Other admins can only see employees
            return userRepository.findAll()
                    .stream()
                    .filter(user -> user.getUserRole() == UserRole.EMPLOYEE)
                    .map(User::getUserDto)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return user.getUserDto();
    }

    @Override
    public UserDto addUser(SignupRequest signupRequest) {
        if (userRepository.findFirstByEmail(signupRequest.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User with this email already exists");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setName(signupRequest.getName());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setUserRole(UserRole.EMPLOYEE);

        User savedUser = userRepository.save(user);
        return savedUser.getUserDto();
    }

    @Override
    public UserDto updateUser(Long id, SignupRequest signupRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if email is being changed and if it's already taken
        if (!user.getEmail().equals(signupRequest.getEmail()) &&
                userRepository.findFirstByEmail(signupRequest.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already taken");
        }

        user.setEmail(signupRequest.getEmail());
        user.setName(signupRequest.getName());
        if (signupRequest.getPassword() != null && !signupRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return updatedUser.getUserDto();
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserDto updateUserRole(Long id, UserRole newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Prevent changing the role of the last admin
        if (user.getUserRole() == UserRole.ADMIN && newRole == UserRole.EMPLOYEE) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getUserRole() == UserRole.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the last admin user");
            }
        }

        user.setUserRole(newRole);
        User updatedUser = userRepository.save(user);
        return updatedUser.getUserDto();
    }
}
