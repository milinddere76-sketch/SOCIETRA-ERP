package com.chs.society.service;

import com.chs.society.dto.AuditReportDTO;
import com.chs.society.dto.BalanceSheetDTO;
import com.chs.society.dto.FinancialTransactionDto;
import com.chs.society.model.FinancialTransaction;
import com.chs.society.model.accounting.AccountGroup;
import com.chs.society.model.accounting.Ledger;
import com.chs.society.repository.FinancialTransactionRepository;
import com.chs.society.repository.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountingReportService {

    private final LedgerRepository ledgerRepository;
    private final FinancialTransactionRepository transactionRepository;

    public BalanceSheetDTO generateBalanceSheet(UUID societyId) {
        List<Ledger> allLedgers = ledgerRepository.findBySocietyId(societyId);

        Map<String, BigDecimal> assets = new HashMap<>();
        Map<String, BigDecimal> liabilities = new HashMap<>();

        final BigDecimal[] totalAssets = { BigDecimal.ZERO };
        final BigDecimal[] totalLiabilities = { BigDecimal.ZERO };

        allLedgers.forEach(ledger -> {
            BigDecimal balance = ledger.getCurrentBalance();
            if (ledger.getGroup().getType() == AccountGroup.AccountType.ASSET) {
                assets.put(ledger.getName(), balance);
                totalAssets[0] = totalAssets[0].add(balance);
            } else if (ledger.getGroup().getType() == AccountGroup.AccountType.LIABILITY) {
                liabilities.put(ledger.getName(), balance);
                totalLiabilities[0] = totalLiabilities[0].add(balance);
            }
        });

        // Surplus/Deficit is calculated from (Income - Expense) and usually added to
        // Liabilities as 'General Fund'
        // For simplicity in this DTO, we'll calculate the gap.
        BigDecimal surplus = totalAssets[0].subtract(totalLiabilities[0]);

        return BalanceSheetDTO.builder()
                .assets(assets)
                .liabilities(liabilities)
                .totalAssets(totalAssets[0])
                .totalLiabilities(totalLiabilities[0])
                .surplusOrDeficit(surplus)
                .build();
    }

    public AuditReportDTO generateAuditReport(UUID societyId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<FinancialTransaction> transactions = transactionRepository
                .findBySocietyIdAndDateBetweenOrderByIdDesc(societyId, start, end);

        Map<String, Long> approvals = new HashMap<>();
        long approvedCount = 0;
        long pendingCount = 0;
        long rejectedCount = 0;
        double totalApproved = 0;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        List<FinancialTransactionDto> dtos = transactions.stream().map(t -> {
            String approver = t.getApprovedBy() != null
                    ? (t.getApprovedBy().getFirstName() + " " + t.getApprovedBy().getLastName())
                    : "";
            if (t.getStatus() == FinancialTransaction.TransactionStatus.APPROVED) {
                approvals.put(approver, approvals.getOrDefault(approver, 0L) + 1);
            }
            return FinancialTransactionDto.builder()
                    .id(t.getId())
                    .description(t.getDescription())
                    .amount(t.getAmount())
                    .type(t.getType())
                    .category(t.getCategory())
                    .status(t.getStatus().name())
                    .date(t.getDate() != null ? t.getDate().format(formatter) : "")
                    .createdBy(t.getCreatedBy() != null
                            ? t.getCreatedBy().getFirstName() + " " + t.getCreatedBy().getLastName()
                            : "")
                    .approvedBy(approver)
                    .approvalDate(t.getApprovalDate() != null ? t.getApprovalDate().format(formatter) : "")
                    .paymentMode(t.getPaymentMode())
                    .voucherNumber(t.getVoucherNumber())
                    .build();
        }).collect(Collectors.toList());

        for (FinancialTransaction t : transactions) {
            if (t.getStatus() == FinancialTransaction.TransactionStatus.APPROVED) {
                approvedCount++;
                totalApproved += t.getAmount();
            } else if (t.getStatus() == FinancialTransaction.TransactionStatus.PENDING) {
                pendingCount++;
            } else {
                rejectedCount++;
            }
        }

        return AuditReportDTO.builder()
                .month(ym.getMonth().name())
                .year(year)
                .totalTransactions(transactions.size())
                .approvedCount(approvedCount)
                .pendingCount(pendingCount)
                .rejectedCount(rejectedCount)
                .totalAmountApproved(totalApproved)
                .approvalsByUser(approvals)
                .transactions(dtos)
                .build();
    }

    public List<FinancialTransactionDto> generateDaybook(UUID societyId, LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        List<FinancialTransaction> transactions = transactionRepository
                .findBySocietyIdAndDateBetweenOrderByIdDesc(societyId, date, date);

        return transactions.stream().map(t -> FinancialTransactionDto.builder()
                .id(t.getId())
                .description(t.getDescription())
                .amount(t.getAmount())
                .type(t.getType())
                .category(t.getCategory())
                .status(t.getStatus().name())
                .date(t.getDate() != null ? t.getDate().format(formatter) : "")
                .voucherNumber(t.getVoucherNumber())
                .paymentMode(t.getPaymentMode())
                .build()).collect(Collectors.toList());
    }

    public Map<String, Object> generateLedgerReport(UUID societyId, UUID ledgerId) {
        Ledger ledger = ledgerRepository.findById(ledgerId).orElseThrow();
        List<FinancialTransaction> transactions = transactionRepository
                .findBySocietyIdAndCategoryOrderByIdDesc(societyId, ledger.getName());

        Map<String, Object> report = new HashMap<>();
        report.put("ledgerName", ledger.getName());
        report.put("currentBalance", ledger.getCurrentBalance());
        report.put("transactions", transactions);
        return report;
    }

    public Map<String, BigDecimal> generateProfitAndLoss(UUID societyId) {
        List<Ledger> allLedgers = ledgerRepository.findBySocietyId(societyId);
        Map<String, BigDecimal> pl = new HashMap<>();

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Ledger l : allLedgers) {
            if (l.getGroup().getType() == AccountGroup.AccountType.INCOME) {
                totalIncome = totalIncome.add(l.getCurrentBalance());
            } else if (l.getGroup().getType() == AccountGroup.AccountType.EXPENSE) {
                totalExpense = totalExpense.add(l.getCurrentBalance());
            }
        }

        pl.put("Total Income", totalIncome);
        pl.put("Total Expense", totalExpense);
        pl.put("Net Profit", totalIncome.subtract(totalExpense));
        return pl;
    }
}
