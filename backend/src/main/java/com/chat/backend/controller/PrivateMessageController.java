package com.chat.backend.controller;

import com.chat.backend.dto.PrivateMessageDTO;
import com.chat.backend.model.PrivateMessage;
import com.chat.backend.model.User;
import com.chat.backend.repository.PrivateMessageRepository;
import com.chat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/private")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class PrivateMessageController {

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendPrivateMessage")
    public void sendPrivateMessage(PrivateMessageDTO messageDTO, Authentication authentication) {
        String senderUsername = authentication.getName();
        
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User receiver = userRepository.findByUsername(messageDTO.getReceiverUsername())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        PrivateMessage privateMessage = new PrivateMessage(sender, receiver, messageDTO.getContent());
        privateMessageRepository.save(privateMessage);

        // Create response DTO
        PrivateMessageDTO responseDTO = new PrivateMessageDTO(
                privateMessage.getId(),
                sender.getUsername(),
                sender.getDisplayName(),
                receiver.getUsername(),
                receiver.getDisplayName(),
                privateMessage.getContent(),
                privateMessage.getTimestamp(),
                privateMessage.getIsRead()
        );

        // Send to specific user's private queue
        messagingTemplate.convertAndSend("/topic/private/" + receiver.getUsername(), responseDTO);
        messagingTemplate.convertAndSend("/topic/private/" + sender.getUsername(), responseDTO);
    }

    @GetMapping("/conversation/{username}")
    public ResponseEntity<List<PrivateMessageDTO>> getConversation(@PathVariable String username, Authentication authentication) {
        String currentUser = authentication.getName();
        
        User user1 = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User user2 = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        List<PrivateMessage> messages = privateMessageRepository.findConversation(user1, user2);
        
        List<PrivateMessageDTO> messageDTOs = messages.stream()
                .map(pm -> new PrivateMessageDTO(
                        pm.getId(),
                        pm.getSender().getUsername(),
                        pm.getSender().getDisplayName(),
                        pm.getReceiver().getUsername(),
                        pm.getReceiver().getDisplayName(),
                        pm.getContent(),
                        pm.getTimestamp(),
                        pm.getIsRead()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(messageDTOs);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long unreadCount = privateMessageRepository.countUnreadMessages(user);
        return ResponseEntity.ok(unreadCount);
    }

    @PostMapping("/mark-read/{messageId}")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PrivateMessage message = privateMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.getReceiver().getUsername().equals(username)) {
            message.setIsRead(true);
            privateMessageRepository.save(message);
        }

        return ResponseEntity.ok().build();
    }
}
