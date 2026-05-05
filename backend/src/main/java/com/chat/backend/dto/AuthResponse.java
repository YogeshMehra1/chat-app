package com.chat.backend.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String displayName;
    private String message;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, String username, String displayName) {
        this.token = token;
        this.username = username;
        this.displayName = displayName;
        this.message = "Authentication successful";
    }
    
    public AuthResponse(String token, String username, String displayName, String message) {
        this.token = token;
        this.username = username;
        this.displayName = displayName;
        this.message = message;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
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
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
