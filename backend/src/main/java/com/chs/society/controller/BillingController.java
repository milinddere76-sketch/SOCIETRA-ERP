package com.chs.society.controller;

import com.chs.society.dto.MaintenanceBillDto;
import com.chs.society.service.BillingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService service;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_DASHBOARD')")
    public ResponseEntity<List<MaintenanceBillDto>> getBills(Authentication auth) {
        return ResponseEntity.ok(service.getBillsBySociety(auth.getName()));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('VIEW_DASHBOARD')")
    public ResponseEntity<String> generateBills(Authentication auth, @RequestBody BillGenerationRequest req) {
        service.generateBillsForSociety(auth.getName(), req.getBillingMonth(), req.getGenerationDate(),
                req.getDueDate());
        return ResponseEntity.ok("Bills generated successfully for all active units.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_DASHBOARD')")
    public ResponseEntity<String> deleteBill(Authentication auth, @PathVariable String id) {
        service.deleteBill(id, auth.getName());
        return ResponseEntity.ok("Bill deleted successfully.");
    }
}

@Data
class BillGenerationRequest {
    private String billingMonth;
    private LocalDate generationDate;
    private LocalDate dueDate;
}
