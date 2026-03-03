package com.chs.society.controller;

import com.chs.society.model.maintenance.MaintenanceHead;
import com.chs.society.repository.MaintenanceHeadRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance-heads")
@RequiredArgsConstructor
public class MaintenanceHeadController {

    private final MaintenanceHeadRepository headRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<MaintenanceHead>> getHeads(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (user.getSociety() == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(headRepository.findBySocietyId(user.getSociety().getId()));
    }

    @PostMapping
    public ResponseEntity<MaintenanceHead> createHead(Authentication authentication,
            @RequestBody MaintenanceHead head) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (user.getSociety() == null)
            return ResponseEntity.badRequest().build();
        head.setSociety(user.getSociety());
        return ResponseEntity.ok(headRepository.save(head));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHead(Authentication authentication, @PathVariable UUID id) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        MaintenanceHead head = headRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        if (!head.getSociety().getId().equals(user.getSociety().getId())) {
            return ResponseEntity.status(403).build();
        }
        headRepository.delete(head);
        return ResponseEntity.ok().build();
    }
}
