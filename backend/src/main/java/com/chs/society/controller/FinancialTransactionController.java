package com.chs.society.controller;

import com.chs.society.dto.FinancialTransactionDto;
import com.chs.society.service.FinancialTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
public class FinancialTransactionController {

    private final FinancialTransactionService service;

    @GetMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<FinancialTransactionDto>> getTransactions(Authentication auth) {
        return ResponseEntity.ok(service.getByUserEmail(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SOCIETY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<FinancialTransactionDto> addTransaction(Authentication auth,
            @RequestBody FinancialTransactionDto dto) {
        return ResponseEntity.ok(service.saveTransaction(auth.getName(), dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SOCIETY_ADMIN')")
    public ResponseEntity<FinancialTransactionDto> updateTransaction(Authentication auth, @PathVariable UUID id,
            @RequestBody FinancialTransactionDto dto) {
        return ResponseEntity.ok(service.updateTransaction(auth.getName(), id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SOCIETY_ADMIN')")
    public ResponseEntity<Void> deleteTransaction(Authentication auth, @PathVariable UUID id) {
        service.deleteTransaction(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SOCIETY_ADMIN')")
    public ResponseEntity<FinancialTransactionDto> approveTransaction(Authentication auth, @PathVariable UUID id) {
        return ResponseEntity.ok(service.approveTransaction(auth.getName(), id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('SOCIETY_ADMIN')")
    public ResponseEntity<FinancialTransactionDto> rejectTransaction(Authentication auth, @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(service.rejectTransaction(auth.getName(), id, body.get("reason")));
    }
}
