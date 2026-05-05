package com.chat.backend.controller;

import com.chat.backend.dto.ReactionDTO;
import com.chat.backend.model.Message;
import com.chat.backend.model.Reaction;
import com.chat.backend.model.User;
import com.chat.backend.repository.MessageRepository;
import com.chat.backend.repository.ReactionRepository;
import com.chat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ReactionController {

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/addReaction")
    public void addReaction(ReactionDTO reactionDTO, Authentication authentication) {
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Message message = messageRepository.findById(reactionDTO.getMessageId())
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Check if user already reacted to this message
        Optional<Reaction> existingReaction = reactionRepository.findByMessageAndUser(message, user);
        
        Reaction reaction;
        if (existingReaction.isPresent()) {
            // Update existing reaction
            reaction = existingReaction.get();
            reaction.setEmoji(reactionDTO.getEmoji());
        } else {
            // Create new reaction
            reaction = new Reaction(message, user, reactionDTO.getEmoji());
        }
        
        reactionRepository.save(reaction);

        // Broadcast the reaction
        ReactionDTO responseDTO = new ReactionDTO(
                reaction.getId(),
                message.getId(),
                user.getUsername(),
                user.getDisplayName(),
                reaction.getEmoji(),
                reaction.getCreatedAt()
        );

        messagingTemplate.convertAndSend("/topic/reactions/" + reactionDTO.getMessageId(), responseDTO);
    }

    @MessageMapping("/removeReaction")
    public void removeReaction(@RequestBody Long messageId, Authentication authentication) {
        String username = authentication.getName();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByMessageAndUser(message, user);
        
        if (existingReaction.isPresent()) {
            reactionRepository.delete(existingReaction.get());
            
            // Broadcast reaction removal
            messagingTemplate.convertAndSend("/topic/reactions/" + messageId, 
                new ReactionDTO(null, messageId, username, null, null, null));
        }
    }

    @GetMapping("/message/{messageId}")
    public ResponseEntity<List<ReactionDTO>> getMessageReactions(@PathVariable Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        List<Reaction> reactions = reactionRepository.findByMessage(message);
        
        List<ReactionDTO> reactionDTOs = reactions.stream()
                .map(reaction -> new ReactionDTO(
                        reaction.getId(),
                        reaction.getMessage().getId(),
                        reaction.getUser().getUsername(),
                        reaction.getUser().getDisplayName(),
                        reaction.getEmoji(),
                        reaction.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(reactionDTOs);
    }

    @GetMapping("/my-reaction/{messageId}")
    public ResponseEntity<ReactionDTO> getMyReaction(@PathVariable Long messageId, Authentication authentication) {
        String username = authentication.getName();
        
        Optional<Reaction> reaction = reactionRepository.findByMessageIdAndUsername(messageId, username);
        
        if (reaction.isPresent()) {
            Reaction r = reaction.get();
            ReactionDTO reactionDTO = new ReactionDTO(
                    r.getId(),
                    r.getMessage().getId(),
                    r.getUser().getUsername(),
                    r.getUser().getDisplayName(),
                    r.getEmoji(),
                    r.getCreatedAt()
            );
            return ResponseEntity.ok(reactionDTO);
        } else {
            return ResponseEntity.ok().build();
        }
    }
}
