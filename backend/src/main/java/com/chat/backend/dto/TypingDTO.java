package com.chat.backend.dto;

public class TypingDTO {
    
    private String username;
    private String room;
    private Boolean isTyping;
    
    public TypingDTO() {}
    
    public TypingDTO(String username, String room, Boolean isTyping) {
        this.username = username;
        this.room = room;
        this.isTyping = isTyping;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRoom() {
        return room;
    }
    
    public void setRoom(String room) {
        this.room = room;
    }
    
    public Boolean getIsTyping() {
        return isTyping;
    }
    
    public void setIsTyping(Boolean isTyping) {
        this.isTyping = isTyping;
    }
}
