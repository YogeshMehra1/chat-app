package com.chat.backend.controller;

import com.chat.backend.model.Message;
import com.chat.backend.model.PrivateMessage;
import com.chat.backend.repository.MessageRepository;
import com.chat.backend.repository.PrivateMessageRepository;
import com.chat.backend.repository.UserRepository;
import com.chat.backend.dto.ChatMessage;
import com.chat.backend.dto.PrivateMessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SearchController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> searchMessages(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        
        Specification<Message> spec = (root, criteriaQuery, criteriaBuilder) -> {
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("content")), 
                "%" + query.toLowerCase() + "%"
            );
        };
        
        Page<Message> messages = messageRepository.findAll(spec, pageable);
        
        List<ChatMessage> chatMessages = messages.getContent().stream()
                .map(message -> {
                    ChatMessage chatMessage = new ChatMessage();
                    chatMessage.setContent(message.getContent());
                    chatMessage.setSender(message.getSender());
                    chatMessage.setTimestamp(message.getTimestamp());
                    return chatMessage;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(chatMessages);
    }

    @GetMapping("/private-messages")
    public ResponseEntity<List<PrivateMessageDTO>> searchPrivateMessages(
            @RequestParam String query,
            @RequestParam String withUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        
        // Find conversation between current user and target user
        var user1 = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var user2 = userRepository.findByUsername(withUser)
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        List<PrivateMessage> conversation = privateMessageRepository.findConversation(user1, user2);
        
        // Filter messages by search query
        List<PrivateMessage> filteredMessages = conversation.stream()
                .filter(pm -> pm.getContent().toLowerCase().contains(query.toLowerCase()))
                .skip(page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        List<PrivateMessageDTO> messageDTOs = filteredMessages.stream()
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

    @GetMapping("/users")
    public ResponseEntity<List<String>> searchUsers(@RequestParam String query) {
        List<String> usernames = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                              user.getDisplayName().toLowerCase().contains(query.toLowerCase()))
                .map(user -> user.getUsername())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(usernames);
    }

    @GetMapping("/all")
    public ResponseEntity<Object> searchAll(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        
        // Search public messages
        Specification<Message> publicSpec = (root, criteriaQuery, criteriaBuilder) -> {
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("content")), 
                "%" + query.toLowerCase() + "%"
            );
        };
        
        Page<Message> publicMessages = messageRepository.findAll(
            publicSpec, 
            PageRequest.of(page, size, Sort.by("timestamp").descending())
        );
        
        List<ChatMessage> publicChatMessages = publicMessages.getContent().stream()
                .map(message -> {
                    ChatMessage chatMessage = new ChatMessage();
                    chatMessage.setContent(message.getContent());
                    chatMessage.setSender(message.getSender());
                    chatMessage.setTimestamp(message.getTimestamp());
                    return chatMessage;
                })
                .collect(Collectors.toList());
        
        // Search private messages involving current user
        var currentUserEntity = userRepository.findByUsername(currentUser)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PrivateMessage> allPrivateMessages = privateMessageRepository.findAll().stream()
                .filter(pm -> (pm.getSender().getUsername().equals(currentUser) || 
                              pm.getReceiver().getUsername().equals(currentUser)) &&
                              pm.getContent().toLowerCase().contains(query.toLowerCase()))
                .skip(page * size)
                .limit(size)
                .collect(Collectors.toList());
        
        List<PrivateMessageDTO> privateMessageDTOs = allPrivateMessages.stream()
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
        
        var response = new java.util.HashMap<String, Object>();
        response.put("publicMessages", publicChatMessages);
        response.put("privateMessages", privateMessageDTOs);
        response.put("hasMorePublic", publicMessages.hasNext());
        
        return ResponseEntity.ok(response);
    }
}
