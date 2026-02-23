package com.chs.society.controller;

import com.chs.society.dto.BalanceSheetDTO;
import com.chs.society.service.AccountingReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/accounting")
public class AccountingController {

    private final AccountingReportService reportService;

    public AccountingController(AccountingReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetDTO> getBalanceSheet(@RequestParam UUID societyId) {
        return ResponseEntity.ok(reportService.generateBalanceSheet(societyId));
    }
}
