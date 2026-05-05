package com.chat.backend.controller;

import com.chat.backend.dto.TypingDTO;
import com.chat.backend.service.TypingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/typing")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class TypingController {

    @Autowired
    private TypingService typingService;

    @MessageMapping("/startTyping")
    public void startTyping(TypingDTO typingDTO, Authentication authentication) {
        String username = "Anonymous";
        
        if (authentication != null) {
            username = authentication.getName();
        }
        
        String room = typingDTO.getRoom();
        
        if (room.startsWith("private:")) {
            // Private chat typing
            String[] parts = room.split(":");
            if (parts.length >= 3) {
                String withUser = parts[2];
                typingService.privateUserStartedTyping(username, withUser);
            }
        } else {
            // Public chat typing
            typingService.userStartedTyping(username, room);
        }
    }

    @MessageMapping("/stopTyping")
    public void stopTyping(TypingDTO typingDTO, Authentication authentication) {
        String username = "Anonymous";
        
        if (authentication != null) {
            username = authentication.getName();
        }
        
        String room = typingDTO.getRoom();
        
        if (room.startsWith("private:")) {
            // Private chat typing
            String[] parts = room.split(":");
            if (parts.length >= 3) {
                String withUser = parts[2];
                typingService.privateUserStoppedTyping(username, withUser);
            }
        } else {
            // Public chat typing
            typingService.userStoppedTyping(username, room);
        }
    }

    @PostMapping("/start")
    public void startTypingRest(@RequestParam String room, Authentication authentication) {
        String username = authentication.getName();
        
        if (room.startsWith("private:")) {
            String[] parts = room.split(":");
            if (parts.length >= 3) {
                String withUser = parts[2];
                typingService.privateUserStartedTyping(username, withUser);
            }
        } else {
            typingService.userStartedTyping(username, room);
        }
    }

    @PostMapping("/stop")
    public void stopTypingRest(@RequestParam String room, Authentication authentication) {
        String username = authentication.getName();
        
        if (room.startsWith("private:")) {
            String[] parts = room.split(":");
            if (parts.length >= 3) {
                String withUser = parts[2];
                typingService.privateUserStoppedTyping(username, withUser);
            }
        } else {
            typingService.userStoppedTyping(username, room);
        }
    }
}
