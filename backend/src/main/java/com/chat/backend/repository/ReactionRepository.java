package com.chat.backend.repository;

import com.chat.backend.model.Reaction;
import com.chat.backend.model.Message;
import com.chat.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    
    List<Reaction> findByMessage(Message message);
    
    Optional<Reaction> findByMessageAndUser(Message message, User user);
    
    @Query("SELECT r FROM Reaction r WHERE r.message.id = :messageId")
    List<Reaction> findByMessageId(@Param("messageId") Long messageId);
    
    @Query("SELECT r FROM Reaction r WHERE r.message.id = :messageId AND r.user.username = :username")
    Optional<Reaction> findByMessageIdAndUsername(@Param("messageId") Long messageId, @Param("username") String username);
    
    void deleteByMessageAndUser(Message message, User user);
}
