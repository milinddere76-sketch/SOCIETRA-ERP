package com.chs.society.controller;

import com.chs.society.dto.VisitorLogDto;
import com.chs.society.service.VisitorLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security/visitors")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
public class VisitorLogController {

    private final VisitorLogService service;

    @GetMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<VisitorLogDto>> getVisitors(Authentication auth) {
        return ResponseEntity.ok(service.getByUserEmail(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<VisitorLogDto> addVisitor(Authentication auth, @RequestBody VisitorLogDto dto) {
        return ResponseEntity.ok(service.saveVisitor(auth.getName(), dto));
    }
}
