package com.chat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class PrivateMessageDTO {
    
    private Long id;
    private String senderUsername;
    private String senderDisplayName;
    private String receiverUsername;
    private String receiverDisplayName;
    private String content;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;
    
    private Boolean isRead;
    
    public PrivateMessageDTO() {}
    
    public PrivateMessageDTO(Long id, String senderUsername, String senderDisplayName, 
                           String receiverUsername, String receiverDisplayName, 
                           String content, LocalDateTime timestamp, Boolean isRead) {
        this.id = id;
        this.senderUsername = senderUsername;
        this.senderDisplayName = senderDisplayName;
        this.receiverUsername = receiverUsername;
        this.receiverDisplayName = receiverDisplayName;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSenderUsername() {
        return senderUsername;
    }
    
    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }
    
    public String getSenderDisplayName() {
        return senderDisplayName;
    }
    
    public void setSenderDisplayName(String senderDisplayName) {
        this.senderDisplayName = senderDisplayName;
    }
    
    public String getReceiverUsername() {
        return receiverUsername;
    }
    
    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }
    
    public String getReceiverDisplayName() {
        return receiverDisplayName;
    }
    
    public void setReceiverDisplayName(String receiverDisplayName) {
        this.receiverDisplayName = receiverDisplayName;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
}
