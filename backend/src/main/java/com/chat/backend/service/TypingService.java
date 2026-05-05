package com.chat.backend.service;

import com.chat.backend.dto.TypingDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TypingService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<String, Long> typingUsers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private static final long TYPING_TIMEOUT_MS = 3000; // 3 seconds

    public TypingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void userStartedTyping(String username, String room) {
        typingUsers.put(username + ":" + room, System.currentTimeMillis());
        
        // Broadcast typing event
        TypingDTO typingDTO = new TypingDTO(username, room, true);
        messagingTemplate.convertAndSend("/topic/typing/" + room, typingDTO);
        
        // Schedule removal after timeout
        scheduler.schedule(() -> {
            String key = username + ":" + room;
            Long lastTypingTime = typingUsers.get(key);
            if (lastTypingTime != null && System.currentTimeMillis() - lastTypingTime >= TYPING_TIMEOUT_MS) {
                userStoppedTyping(username, room);
            }
        }, TYPING_TIMEOUT_MS, TimeUnit.MILLISECONDS);
    }

    public void userStoppedTyping(String username, String room) {
        String key = username + ":" + room;
        typingUsers.remove(key);
        
        // Broadcast stop typing event
        TypingDTO typingDTO = new TypingDTO(username, room, false);
        messagingTemplate.convertAndSend("/topic/typing/" + room, typingDTO);
    }

    public void privateUserStartedTyping(String username, String withUser) {
        String room = "private:" + username + ":" + withUser;
        typingUsers.put(username + ":" + room, System.currentTimeMillis());
        
        // Send to both users in private chat
        TypingDTO typingDTO = new TypingDTO(username, room, true);
        messagingTemplate.convertAndSend("/topic/typing/private/" + withUser, typingDTO);
        
        // Schedule removal after timeout
        scheduler.schedule(() -> {
            String key = username + ":" + room;
            Long lastTypingTime = typingUsers.get(key);
            if (lastTypingTime != null && System.currentTimeMillis() - lastTypingTime >= TYPING_TIMEOUT_MS) {
                privateUserStoppedTyping(username, withUser);
            }
        }, TYPING_TIMEOUT_MS, TimeUnit.MILLISECONDS);
    }

    public void privateUserStoppedTyping(String username, String withUser) {
        String room = "private:" + username + ":" + withUser;
        String key = username + ":" + room;
        typingUsers.remove(key);
        
        // Send to both users in private chat
        TypingDTO typingDTO = new TypingDTO(username, room, false);
        messagingTemplate.convertAndSend("/topic/typing/private/" + withUser, typingDTO);
    }
}
