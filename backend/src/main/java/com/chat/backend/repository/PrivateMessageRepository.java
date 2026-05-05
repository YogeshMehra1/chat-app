package com.chat.backend.repository;

import com.chat.backend.model.PrivateMessage;
import com.chat.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, Long> {
    
    @Query("SELECT pm FROM PrivateMessage pm WHERE " +
           "(pm.sender = :user1 AND pm.receiver = :user2) OR " +
           "(pm.sender = :user2 AND pm.receiver = :user1) " +
           "ORDER BY pm.timestamp ASC")
    List<PrivateMessage> findConversation(@Param("user1") User user1, @Param("user2") User user2);
    
    List<PrivateMessage> findByReceiverAndIsReadFalse(User receiver);
    
    @Query("SELECT COUNT(pm) FROM PrivateMessage pm WHERE pm.receiver = :user AND pm.isRead = false")
    Long countUnreadMessages(@Param("user") User user);
}
