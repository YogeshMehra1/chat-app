package com.chat.backend.controller;

import com.chat.backend.dto.AuthResponse;
import com.chat.backend.dto.LoginRequest;
import com.chat.backend.dto.RegisterRequest;
import com.chat.backend.model.Role;
import com.chat.backend.model.User;
import com.chat.backend.repository.RoleRepository;
import com.chat.backend.repository.UserRepository;
import com.chat.backend.service.JWTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                AuthResponse response = new AuthResponse(null, null, null, "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }

            if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
                AuthResponse response = new AuthResponse(null, null, null, "Username is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (registerRequest.getPassword() == null || registerRequest.getPassword().length() < 4) {
                AuthResponse response = new AuthResponse(null, null, null, "Password must be at least 4 characters");
                return ResponseEntity.badRequest().body(response);
            }

            User user = new User();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setDisplayName(registerRequest.getDisplayName() != null ? registerRequest.getDisplayName() : registerRequest.getUsername());

            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> {
                        Role newRole = new Role("ROLE_USER");
                        return roleRepository.save(newRole);
                    });

            user.setRoles(Collections.singleton(userRole));
            userRepository.save(user);

            String token = jwtService.generateToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getDisplayName()));
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(null, null, null, "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtService.generateToken(loginRequest.getUsername());

            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getDisplayName()));
        } catch (Exception e) {
            AuthResponse response = new AuthResponse(null, null, null, "Invalid username or password");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new AuthResponse(null, user.getUsername(), user.getDisplayName()));
    }
}
