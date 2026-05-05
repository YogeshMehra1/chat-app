package com.chat.backend.controller;

import com.chat.backend.dto.ChatMessage;
import com.chat.backend.model.Message;
import com.chat.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ChatController {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage chatMessage, Authentication authentication) {
        String sender = "Anonymous";
        
        if (authentication != null) {
            sender = authentication.getName();
        } else if (chatMessage.getSender() != null && !chatMessage.getSender().trim().isEmpty()) {
            sender = chatMessage.getSender();
        }
        
        Message message = new Message(chatMessage.getContent(), sender);
        messageRepository.save(message);
        
        ChatMessage response = new ChatMessage();
        response.setContent(chatMessage.getContent());
        response.setSender(sender);
        response.setTimestamp(message.getTimestamp());
        
        return response;
    }
    
    @GetMapping("/api/messages")
    @ResponseBody
    public List<ChatMessage> getRecentMessages() {
        return messageRepository.findAll()
                .stream()
                .sorted((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()))
                .limit(50)
                .map(message -> {
                    ChatMessage chatMessage = new ChatMessage();
                    chatMessage.setContent(message.getContent());
                    chatMessage.setSender(message.getSender());
                    chatMessage.setTimestamp(message.getTimestamp());
                    return chatMessage;
                })
                .collect(Collectors.toList());
    }
}
