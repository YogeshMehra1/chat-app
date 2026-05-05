package com.chat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class UserPresenceDTO {
    
    private String username;
    private String displayName;
    private String avatarUrl;
    private Boolean isOnline;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime lastSeen;
    
    public UserPresenceDTO() {}
    
    public UserPresenceDTO(String username, String displayName, String avatarUrl, Boolean isOnline, LocalDateTime lastSeen) {
        this.username = username;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public Boolean getIsOnline() {
        return isOnline;
    }
    
    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}
