package com.chs.society.controller;

import com.chs.society.dto.ComplaintDto;
import com.chs.society.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    public ResponseEntity<List<ComplaintDto>> getComplaints(Authentication auth) {
        return ResponseEntity.ok(complaintService.getComplaintsByUserOrSociety(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<ComplaintDto> createComplaint(Authentication auth, @RequestBody ComplaintDto dto) {
        return ResponseEntity.ok(complaintService.createComplaint(auth.getName(), dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintDto> updateStatus(Authentication auth, @PathVariable UUID id, @RequestParam String status, @RequestParam(required = false) String note) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(auth.getName(), id, status, note));
    }
}
