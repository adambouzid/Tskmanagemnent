package com.taskapp.backend.controller.admin;

import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.dto.UserDto;
import com.taskapp.backend.enums.UserRole;
import com.taskapp.backend.services.admin.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) UserRole role
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Current user: {}", auth.getName());
        log.info("Current authorities: {}", auth.getAuthorities());
        return ResponseEntity.ok(adminService.searchUsers(page, size, search, role));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<?> addUser(@RequestBody SignupRequest signupRequest) {
        return ResponseEntity.ok(adminService.addUser(signupRequest));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody SignupRequest signupRequest) {
        return ResponseEntity.ok(adminService.updateUser(id, signupRequest));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody UserRole newRole) {
        return ResponseEntity.ok(adminService.updateUserRole(id, newRole));
    }

    @GetMapping("/test")
    public  String test(){
        return "testsucces";

    }
}