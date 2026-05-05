package com.chat.backend.service;

import com.chat.backend.model.User;
import com.chat.backend.repository.UserRepository;
import com.chat.backend.dto.UserPresenceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final ConcurrentHashMap<String, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();

    public void userConnected(String username) {
        onlineUsers.put(username, LocalDateTime.now());
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            user.setIsOnline(true);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        }

        broadcastOnlineUsers();
    }

    public void userDisconnected(String username) {
        onlineUsers.remove(username);
        
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            user.setIsOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        }

        broadcastOnlineUsers();
    }

    public List<UserPresenceDTO> getOnlineUsers() {
        return onlineUsers.keySet().stream()
                .map(username -> {
                    User user = userRepository.findByUsername(username).orElse(null);
                    if (user != null) {
                        return new UserPresenceDTO(
                                user.getUsername(),
                                user.getDisplayName(),
                                user.getAvatarUrl(),
                                true,
                                onlineUsers.get(username)
                        );
                    }
                    return null;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<UserPresenceDTO> getAllUsersWithPresence() {
        return userRepository.findAll().stream()
                .map(user -> new UserPresenceDTO(
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getAvatarUrl(),
                        user.getIsOnline(),
                        user.getLastSeen()
                ))
                .collect(Collectors.toList());
    }

    private void broadcastOnlineUsers() {
        List<UserPresenceDTO> onlineUsers = getOnlineUsers();
        messagingTemplate.convertAndSend("/topic/online-users", onlineUsers);
    }

    public void updateHeartbeat(String username) {
        onlineUsers.put(username, LocalDateTime.now());
    }
}
