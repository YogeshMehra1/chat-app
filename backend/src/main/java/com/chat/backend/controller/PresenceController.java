package com.chat.backend.controller;

import com.chat.backend.dto.UserPresenceDTO;
import com.chat.backend.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presence")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class PresenceController {

    @Autowired
    private PresenceService presenceService;

    @MessageMapping("/heartbeat")
    public void heartbeat(Authentication authentication) {
        String username = authentication.getName();
        presenceService.updateHeartbeat(username);
    }

    @GetMapping("/online-users")
    public ResponseEntity<List<UserPresenceDTO>> getOnlineUsers() {
        List<UserPresenceDTO> onlineUsers = presenceService.getOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<UserPresenceDTO>> getAllUsers() {
        List<UserPresenceDTO> allUsers = presenceService.getAllUsersWithPresence();
        return ResponseEntity.ok(allUsers);
    }

    @PostMapping("/connect")
    public ResponseEntity<Void> userConnected(Authentication authentication) {
        String username = authentication.getName();
        presenceService.userConnected(username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/disconnect")
    public ResponseEntity<Void> userDisconnected(Authentication authentication) {
        String username = authentication.getName();
        presenceService.userDisconnected(username);
        return ResponseEntity.ok().build();
    }
}
