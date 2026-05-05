package com.chat.backend.controller;

import com.chat.backend.dto.UserProfileDTO;
import com.chat.backend.model.User;
import com.chat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO profile = new UserProfileDTO(
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getStatus(),
                user.getIsOnline(),
                user.getLastSeen(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO profile = new UserProfileDTO(
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getStatus(),
                user.getIsOnline(),
                user.getLastSeen(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            @RequestBody UserProfileDTO profileDTO,
            Authentication authentication) {
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields
        if (profileDTO.getDisplayName() != null) {
            user.setDisplayName(profileDTO.getDisplayName());
        }
        if (profileDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(profileDTO.getAvatarUrl());
        }
        if (profileDTO.getBio() != null) {
            user.setBio(profileDTO.getBio());
        }
        if (profileDTO.getStatus() != null) {
            user.setStatus(profileDTO.getStatus());
        }

        userRepository.save(user);

        UserProfileDTO updatedProfile = new UserProfileDTO(
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getStatus(),
                user.getIsOnline(),
                user.getLastSeen(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        List<UserProfileDTO> profiles = userRepository.findAll().stream()
                .map(user -> new UserProfileDTO(
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getAvatarUrl(),
                        user.getBio(),
                        user.getStatus(),
                        user.getIsOnline(),
                        user.getLastSeen(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(profiles);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(@RequestParam String query) {
        List<UserProfileDTO> profiles = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                              user.getDisplayName().toLowerCase().contains(query.toLowerCase()))
                .map(user -> new UserProfileDTO(
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getAvatarUrl(),
                        user.getBio(),
                        user.getStatus(),
                        user.getIsOnline(),
                        user.getLastSeen(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(profiles);
    }
}
