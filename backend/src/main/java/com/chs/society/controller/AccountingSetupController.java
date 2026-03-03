package com.chs.society.controller;

import com.chs.society.model.FinancialYear;
import com.chs.society.model.User;
import com.chs.society.model.Unit;
import com.chs.society.model.accounting.Ledger;
import com.chs.society.repository.FinancialYearRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.UnitRepository;
import com.chs.society.repository.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.chs.society.model.CommitteeMember;
import com.chs.society.repository.CommitteeMemberRepository;
import com.chs.society.repository.SocietyRepository;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/accounting/setup")
@RequiredArgsConstructor
@Transactional
@lombok.extern.slf4j.Slf4j
public class AccountingSetupController {

    private final FinancialYearRepository yearRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final LedgerRepository ledgerRepository;
    private final CommitteeMemberRepository committeeMemberRepository;
    private final SocietyRepository societyRepository;

    @GetMapping("/years")
    public ResponseEntity<List<FinancialYear>> getYears(Authentication auth,
            @RequestParam(required = false) UUID societyId) {
        log.debug("getYears called with societyId: {}", societyId);
        if (societyId != null) {
            List<FinancialYear> years = yearRepository.findBySocietyId(societyId);
            log.debug("Found {} years for societyId: {}", years.size(), societyId);
            return ResponseEntity.ok(years);
        }
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));

        if (user.getSociety() == null) {
            if (isSuperAdmin) {
                // If super admin and no societyId provided, return empty list or all?
                // Front-end usually provides it. We return empty instead of 403 to avoid UI
                // crashes.
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.status(403).build();
        }
        List<FinancialYear> years = yearRepository.findBySocietyId(user.getSociety().getId());
        return ResponseEntity.ok(years);
    }

    @PostMapping("/years")
    public ResponseEntity<FinancialYear> createYear(Authentication auth, @RequestBody FinancialYearRequest req,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        if (targetSocietyId == null) {
            User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
            if (admin.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = admin.getSociety().getId();
        }

        // Deactivate current active year if new one is active
        if (req.isActive()) {
            yearRepository.findCurrentActiveYearBySociety(targetSocietyId)
                    .ifPresent(y -> {
                        y.setActive(false);
                        yearRepository.save(y);
                    });
        }

        FinancialYear year = FinancialYear.builder()
                .society(societyRepository.findById(java.util.Objects.requireNonNull(targetSocietyId)).orElseThrow())
                .yearName(req.getYearName())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .active(req.isActive())
                .closed(false)
                .build();

        return ResponseEntity.ok(yearRepository.save(java.util.Objects.requireNonNull(year)));
    }

    @lombok.Data
    public static class FinancialYearRequest {
        private String yearName;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;
        private boolean active;
    }

    @PostMapping("/years/{id}/activate")
    public ResponseEntity<String> activateYear(Authentication auth, @PathVariable UUID id) {
        FinancialYear year = yearRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        UUID targetSocietyId = year.getSociety().getId();

        // For society admins, verify ownership
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = admin.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));
        if (!isSuperAdmin && (admin.getSociety() == null || !admin.getSociety().getId().equals(targetSocietyId)))
            return ResponseEntity.status(403).build();

        // Rule: Previous financial years must be closed before starting a new one
        List<FinancialYear> allYears = yearRepository.findBySocietyId(targetSocietyId);
        boolean hasUnclosedPrevious = allYears.stream()
                .anyMatch(y -> y.getStartDate().isBefore(year.getStartDate()) && !y.isClosed()
                        && !y.getId().equals(year.getId()));

        if (hasUnclosedPrevious) {
            return ResponseEntity.badRequest()
                    .body("Previous financial years must be closed before starting a new one.");
        }

        // Deactivate other years
        allYears.forEach(y -> {
            if (y.isActive() && !y.getId().equals(id)) {
                y.setActive(false);
                yearRepository.save(y);
            }
        });

        year.setActive(true);
        yearRepository.save(year);
        return ResponseEntity.ok("Financial Year Activated Successfully");
    }

    @PostMapping("/years/{id}/close")
    public ResponseEntity<Void> closeYear(Authentication auth, @PathVariable UUID id) {
        FinancialYear year = yearRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = admin.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));
        if (!isSuperAdmin
                && (admin.getSociety() == null || !admin.getSociety().getId().equals(year.getSociety().getId())))
            return ResponseEntity.status(403).build();

        year.setClosed(true);
        year.setActive(false);
        yearRepository.save(year);
        return ResponseEntity.ok().build();
    }

    // Units Opening Balances
    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getUnits(Authentication auth,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));

        if (targetSocietyId == null) {
            if (isSuperAdmin)
                return ResponseEntity.ok(List.of());
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = user.getSociety().getId();
        }
        return ResponseEntity.ok(unitRepository.findBySocietyId(java.util.Objects.requireNonNull(targetSocietyId)));
    }

    @PatchMapping("/units/opening-balances")
    public ResponseEntity<Void> updateUnitBalances(Authentication auth,
            @RequestBody List<Map<String, Object>> updates) {
        for (Map<String, Object> update : updates) {
            UUID unitId = UUID.fromString((String) update.get("id"));
            BigDecimal balance = new BigDecimal(update.get("balance").toString());
            String dateStr = (String) update.get("date");

            Unit unit = unitRepository.findById(java.util.Objects.requireNonNull(unitId)).orElseThrow();
            unit.setOpeningBalance(balance);
            if (dateStr != null)
                unit.setOpeningBalanceDate(LocalDate.parse(dateStr));
            unitRepository.save(unit);
        }
        return ResponseEntity.ok().build();
    }

    // Ledgers Opening Balances
    @GetMapping("/ledgers")
    public ResponseEntity<List<Ledger>> getLedgers(Authentication auth,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));

        if (targetSocietyId == null) {
            if (isSuperAdmin)
                return ResponseEntity.ok(List.of());
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = user.getSociety().getId();
        }
        return ResponseEntity.ok(ledgerRepository.findBySocietyId(java.util.Objects.requireNonNull(targetSocietyId)));
    }

    @PatchMapping("/ledgers/opening-balances")
    public ResponseEntity<Void> updateLedgerBalances(Authentication auth,
            @RequestBody List<Map<String, Object>> updates) {
        for (Map<String, Object> update : updates) {
            UUID ledgerId = UUID.fromString((String) update.get("id"));
            BigDecimal balance = new BigDecimal(update.get("balance").toString());
            String dateStr = (String) update.get("date");

            Ledger ledger = ledgerRepository.findById(java.util.Objects.requireNonNull(ledgerId)).orElseThrow();
            ledger.setOpeningBalance(balance);
            if (dateStr != null)
                ledger.setOpeningBalanceDate(LocalDate.parse(dateStr));
            ledgerRepository.save(ledger);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/committee")
    public ResponseEntity<List<CommitteeMember>> getCommittee(Authentication auth,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));

        if (targetSocietyId == null) {
            if (isSuperAdmin)
                return ResponseEntity.ok(List.of());
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = user.getSociety().getId();
        }
        return ResponseEntity
                .ok(committeeMemberRepository.findBySociety(
                        societyRepository.findById(java.util.Objects.requireNonNull(targetSocietyId)).orElseThrow()));
    }

    @PostMapping("/committee")
    public ResponseEntity<CommitteeMember> addCommitteeMember(Authentication auth, @RequestBody CommitteeMember req,
            @RequestParam(required = false) UUID societyId) {
        UUID targetSocietyId = societyId;
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        boolean isSuperAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));

        if (targetSocietyId == null) {
            if (isSuperAdmin)
                return ResponseEntity.status(400).build(); // Superadmin must provide societyId for POST
            if (user.getSociety() == null)
                return ResponseEntity.status(403).build();
            targetSocietyId = user.getSociety().getId();
        }
        req.setSociety(societyRepository.findById(java.util.Objects.requireNonNull(targetSocietyId)).orElseThrow());
        return ResponseEntity.ok(committeeMemberRepository.save(req));
    }

    @DeleteMapping("/committee/{id}")
    public ResponseEntity<Void> removeCommitteeMember(@PathVariable UUID id) {
        committeeMemberRepository.deleteById(java.util.Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }
}
