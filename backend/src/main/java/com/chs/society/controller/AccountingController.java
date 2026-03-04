package com.chs.society.controller;

import com.chs.society.dto.AuditReportDTO;
import com.chs.society.dto.BalanceSheetDTO;
import com.chs.society.model.accounting.Expense;
import com.chs.society.model.accounting.Receipt;
import com.chs.society.repository.ExpenseRepository;
import com.chs.society.repository.ReceiptRepository;
import com.chs.society.service.AccountingReportService;
import com.chs.society.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.chs.society.dto.FinancialTransactionDto;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
public class AccountingController {

    private final AccountingReportService reportService;
    private final ReceiptRepository receiptRepository;
    private final ExpenseRepository expenseRepository;
    private final PdfService pdfService;
    private final com.chs.society.repository.UserRepository userRepository;
    private final com.chs.society.repository.MaintenanceBillRepository billRepository;
    private final com.chs.society.repository.LedgerRepository ledgerRepository;

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetDTO> getBalanceSheet(@RequestParam UUID societyId) {
        return ResponseEntity.ok(reportService.generateBalanceSheet(societyId));
    }

    @GetMapping("/audit-report")
    public ResponseEntity<AuditReportDTO> getAuditReport(
            @RequestParam UUID societyId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        int y = (year != null) ? year : LocalDate.now().getYear();
        int m = (month != null) ? month : LocalDate.now().getMonthValue();

        return ResponseEntity.ok(reportService.generateAuditReport(societyId, y, m));
    }

    @GetMapping("/daybook")
    public ResponseEntity<List<FinancialTransactionDto>> getDaybook(
            @RequestParam UUID societyId,
            @RequestParam(required = false) String date) {
        LocalDate d = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(reportService.generateDaybook(societyId, d));
    }

    @GetMapping("/ledger-report")
    public ResponseEntity<Map<String, Object>> getLedgerReport(
            @RequestParam UUID societyId,
            @RequestParam UUID ledgerId) {
        return ResponseEntity.ok(reportService.generateLedgerReport(societyId, ledgerId));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, java.math.BigDecimal>> getProfitLoss(@RequestParam UUID societyId) {
        return ResponseEntity.ok(reportService.generateProfitAndLoss(societyId));
    }

    // --- RECEIPTS ---

    @GetMapping("/receipts")
    public ResponseEntity<List<Receipt>> getReceipts(Authentication auth) {
        com.chs.society.model.User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(receiptRepository.findBySocietyIdOrderByDateDesc(user.getSociety().getId()));
    }

    @PostMapping("/receipts")
    public ResponseEntity<Receipt> createReceipt(Authentication auth, @RequestBody ReceiptRequest req) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        com.chs.society.model.User member = userRepository.findById(req.getMemberId()).orElseThrow();

        com.chs.society.model.maintenance.MaintenanceBill bill = null;
        if (req.getBillId() != null) {
            bill = billRepository.findById(req.getBillId()).orElseThrow();
            // Update bill status
            bill.setStatus(com.chs.society.model.maintenance.MaintenanceBill.BillStatus.PAID);
            billRepository.save(bill);
        }

        Receipt receipt = Receipt.builder()
                .receiptNumber("REC-" + System.currentTimeMillis() / 1000)
                .date(LocalDate.now())
                .amount(req.getAmount())
                .paymentMode(req.getPaymentMode())
                .transactionReference(req.getReference())
                .member(member)
                .bill(bill)
                .society(admin.getSociety())
                .narration(req.getNarration())
                .build();

        return ResponseEntity.ok(receiptRepository.save(receipt));
    }

    @PutMapping("/receipts/{id}")
    public ResponseEntity<Receipt> updateReceipt(Authentication auth, @PathVariable UUID id,
            @RequestBody ReceiptRequest req) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        Receipt receipt = receiptRepository.findById(id).orElseThrow();
        if (!receipt.getSociety().getId().equals(admin.getSociety().getId()))
            return ResponseEntity.status(403).build();

        com.chs.society.model.User member = userRepository.findById(req.getMemberId()).orElseThrow();
        com.chs.society.model.maintenance.MaintenanceBill bill = null;
        if (req.getBillId() != null) {
            bill = billRepository.findById(req.getBillId()).orElseThrow();
            if (receipt.getBill() == null || !receipt.getBill().getId().equals(bill.getId())) {
                bill.setStatus(com.chs.society.model.maintenance.MaintenanceBill.BillStatus.PAID);
                billRepository.save(bill);
            }
        }

        if (receipt.getBill() != null && (bill == null || !receipt.getBill().getId().equals(bill.getId()))) {
            com.chs.society.model.maintenance.MaintenanceBill oldBill = receipt.getBill();
            oldBill.setStatus(com.chs.society.model.maintenance.MaintenanceBill.BillStatus.UNPAID);
            billRepository.save(oldBill);
        }

        receipt.setAmount(req.getAmount());
        receipt.setPaymentMode(req.getPaymentMode());
        receipt.setTransactionReference(req.getReference());
        receipt.setMember(member);
        receipt.setBill(bill);
        receipt.setNarration(req.getNarration());

        return ResponseEntity.ok(receiptRepository.save(receipt));
    }

    @DeleteMapping("/receipts/{id}")
    public ResponseEntity<Void> deleteReceipt(Authentication auth, @PathVariable UUID id) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        Receipt receipt = receiptRepository.findById(id).orElseThrow();
        if (!receipt.getSociety().getId().equals(admin.getSociety().getId()))
            return ResponseEntity.status(403).build();

        if (receipt.getBill() != null) {
            com.chs.society.model.maintenance.MaintenanceBill bill = receipt.getBill();
            bill.setStatus(com.chs.society.model.maintenance.MaintenanceBill.BillStatus.UNPAID);
            billRepository.save(bill);
        }
        receiptRepository.delete(receipt);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/receipts/{id}/pdf")
    public ResponseEntity<byte[]> downloadReceiptPdf(@PathVariable UUID id) {
        Receipt receipt = receiptRepository.findById(id).orElseThrow();
        byte[] pdf = pdfService.generateReceiptPdf(receipt);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=receipt_" + receipt.getReceiptNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // --- EXPENSES ---

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getExpenses(Authentication auth) {
        com.chs.society.model.User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(expenseRepository.findBySocietyIdOrderByDateDesc(user.getSociety().getId()));
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> createExpense(Authentication auth, @RequestBody ExpenseRequest req) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        com.chs.society.model.accounting.Ledger ledger = ledgerRepository.findById(req.getLedgerId()).orElseThrow();

        Expense expense = Expense.builder()
                .voucherNumber("VOU-" + System.currentTimeMillis() / 1000)
                .date(LocalDate.now())
                .amount(req.getAmount())
                .payee(req.getPayee())
                .description(req.getDescription())
                .ledger(ledger)
                .paymentMode(req.getPaymentMode())
                .referenceNumber(req.getReference())
                .society(admin.getSociety())
                .build();

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<Expense> updateExpense(Authentication auth, @PathVariable UUID id,
            @RequestBody ExpenseRequest req) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        Expense expense = expenseRepository.findById(id).orElseThrow();
        if (!expense.getSociety().getId().equals(admin.getSociety().getId()))
            return ResponseEntity.status(403).build();

        com.chs.society.model.accounting.Ledger ledger = ledgerRepository.findById(req.getLedgerId()).orElseThrow();

        expense.setAmount(req.getAmount());
        expense.setPayee(req.getPayee());
        expense.setDescription(req.getDescription());
        expense.setLedger(ledger);
        expense.setPaymentMode(req.getPaymentMode());
        expense.setReferenceNumber(req.getReference());

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(Authentication auth, @PathVariable UUID id) {
        com.chs.society.model.User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        Expense expense = expenseRepository.findById(id).orElseThrow();
        if (!expense.getSociety().getId().equals(admin.getSociety().getId()))
            return ResponseEntity.status(403).build();

        expenseRepository.delete(expense);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/expenses/{id}/pdf")
    public ResponseEntity<byte[]> downloadVoucherPdf(@PathVariable UUID id) {
        Expense expense = expenseRepository.findById(id).orElseThrow();
        byte[] pdf = pdfService.generatePaymentVoucherPdf(expense);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=voucher_" + expense.getVoucherNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}

@lombok.Data
class ReceiptRequest {
    private UUID memberId;
    private UUID billId;
    private java.math.BigDecimal amount;
    private String paymentMode;
    private String reference;
    private String narration;
}

@lombok.Data
class ExpenseRequest {
    private UUID ledgerId;
    private java.math.BigDecimal amount;
    private String payee;
    private String description;
    private String paymentMode;
    private String reference;
}
