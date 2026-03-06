package com.chs.society.controller;

import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.model.accounting.BankDetail;
import com.chs.society.model.accounting.BankStatementEntry;
import com.chs.society.model.FinancialTransaction;
import com.chs.society.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/reconcile")
@RequiredArgsConstructor
@Transactional
public class BankReconciliationController {

    private final BankDetailRepository bankDetailRepository;
    private final BankStatementEntryRepository entryRepository;
    private final UserRepository userRepository;
    private final FinancialTransactionRepository transactionRepository;
    private final SocietyRepository societyRepository;

    @GetMapping("/bank")
    public ResponseEntity<BankDetail> getBankDetails(Authentication auth,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        if (targetSocietyId == null) {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = user.getSociety().getId();
        }
        return ResponseEntity
                .ok(bankDetailRepository.findBySocietyId(targetSocietyId).orElse(new BankDetail()));
    }

    @PostMapping("/bank")
    public ResponseEntity<BankDetail> saveBankDetails(Authentication auth, @RequestBody BankDetail details,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        Society targetSociety;
        if (targetSocietyId == null) {
            User user = userRepository.findByEmail(auth.getName()).orElseThrow();
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSociety = user.getSociety();
            targetSocietyId = targetSociety.getId();
        } else {
            targetSociety = societyRepository.findById(targetSocietyId)
                    .orElseThrow(() -> new RuntimeException("Society not found"));
        }

        BankDetail existing = bankDetailRepository.findBySocietyId(targetSocietyId).orElse(new BankDetail());
        existing.setSociety(targetSociety);
        existing.setBankName(details.getBankName());
        existing.setAccountNumber(details.getAccountNumber());
        existing.setIfscCode(details.getIfscCode());
        existing.setAccountType(details.getAccountType());
        existing.setQrCodeUrl(details.getQrCodeUrl());

        return ResponseEntity.ok(bankDetailRepository.save(existing));
    }

    @GetMapping("/entries")
    public ResponseEntity<List<BankStatementEntry>> getEntries(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (user.getSociety() == null)
            return ResponseEntity.status(403).build();
        return ResponseEntity.ok(entryRepository.findBySocietyId(user.getSociety().getId()));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<BankStatementEntry>> uploadEntries(Authentication auth,
            @RequestBody List<BankStatementEntry> entries) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Society society = user.getSociety();
        if (society == null)
            return ResponseEntity.status(403).build();

        entries.forEach(e -> e.setSociety(society));
        return ResponseEntity.ok(entryRepository.saveAll(entries));
    }

    @PostMapping("/match/{entryId}")
    public ResponseEntity<BankStatementEntry> matchEntry(Authentication auth, @PathVariable UUID entryId,
            @RequestBody Map<String, UUID> payload) {
        BankStatementEntry entry = entryRepository.findById(entryId).orElseThrow();
        UUID transactionId = payload.get("transactionId");

        if (transactionId == null) {
            entry.setReconciled(false);
            entry.setInternalTransaction(null);
        } else {
            FinancialTransaction txn = transactionRepository.findById(transactionId).orElseThrow();
            entry.setInternalTransaction(txn);
            entry.setReconciled(true);
        }

        return ResponseEntity.ok(entryRepository.save(entry));
    }
}
