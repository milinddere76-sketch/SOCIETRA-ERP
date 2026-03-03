package com.chs.society.controller;

import com.chs.society.dto.MeetingMinutesDto;
import com.chs.society.service.MeetingMinutesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
public class MeetingMinutesController {

    private final MeetingMinutesService service;

    @GetMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<MeetingMinutesDto>> getMeetings(Authentication auth) {
        return ResponseEntity.ok(service.getByUserEmail(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<MeetingMinutesDto> addMeeting(Authentication auth, @RequestBody MeetingMinutesDto dto) {
        return ResponseEntity.ok(service.saveMeeting(auth.getName(), dto));
    }
}
