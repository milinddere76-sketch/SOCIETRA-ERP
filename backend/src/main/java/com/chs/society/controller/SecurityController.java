package com.chs.society.controller;

import com.chs.society.model.VisitorLog;
import com.chs.society.repository.VisitorLogRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    private final VisitorLogRepository visitorLogRepository;

    public SecurityController(VisitorLogRepository visitorLogRepository) {
        this.visitorLogRepository = visitorLogRepository;
    }

    @GetMapping("/visitors")
    public List<VisitorLog> getVisitors(@RequestParam UUID societyId) {
        return visitorLogRepository.findBySocietyIdOrderByEntryTimeDesc(societyId);
    }

    @PostMapping("/check-in")
    public VisitorLog checkIn(@RequestBody VisitorLog log) {
        log.setEntryTime(LocalDateTime.now());
        return visitorLogRepository.save(log);
    }

    @PostMapping("/check-out/{id}")
    public VisitorLog checkOut(@PathVariable UUID id) {
        VisitorLog log = visitorLogRepository.findById(id).orElseThrow();
        log.setExitTime(LocalDateTime.now());
        return visitorLogRepository.save(log);
    }
}
