package com.taskapp.backend.controller.auth;

import com.taskapp.backend.Utils.JwtUtil;
import com.taskapp.backend.dto.AuthenticationRequest;
import com.taskapp.backend.dto.AuthenticationResponse;
import com.taskapp.backend.dto.SignupRequest;
import com.taskapp.backend.dto.UserDto;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.repositories.UserRepository;
import com.taskapp.backend.services.auth.AuthService;
import com.taskapp.backend.services.jwt.UserService;
import io.jsonwebtoken.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private  final UserService userService;
    private  final AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<?> signUser(@RequestBody SignupRequest signupRequest){
        if (authService.hasUserWhitEmail(signupRequest.getEmail()))
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("User already exist whit this email");
        UserDto createUserDto = authService.signUser(signupRequest);
        if (createUserDto == null)
            return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not created");

        return  ResponseEntity.status(HttpStatus.CREATED).body(createUserDto);
    }
    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest authenticationRequest){
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authenticationRequest.getEmail(),authenticationRequest.getPassword()));

        }catch (BadCredentialsException e){
            throw new BadCredentialsException("Incorrect username or password");

        }
        final UserDetails userDetails = userService.userDetailService().loadUserByUsername(authenticationRequest.getEmail());
        Optional<User> optionalUser =userRepository.findFirstByEmail(authenticationRequest.getEmail());
        // Add role as a claim
        String role = optionalUser.map(u -> u.getUserRole().name()).orElse("");
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        final String jwtToken =jwtUtil.generateToken(claims, userDetails);
        AuthenticationResponse authenticationResponse = new AuthenticationResponse();
        if (optionalUser.isPresent()) {
            authenticationResponse.setJwt(jwtToken);
            authenticationResponse.setUserId(optionalUser.get().getId());
            authenticationResponse.setUserRole(optionalUser.get().getUserRole());
        }
        return authenticationResponse;
    }

}
