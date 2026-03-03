package com.chs.society.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AuditReportDTO {
    private String month;
    private int year;
    private long totalTransactions;
    private long approvedCount;
    private long pendingCount;
    private long rejectedCount;
    private double totalAmountApproved;

    private Map<String, Long> approvalsByUser; // Approver Name -> Count
    private List<FinancialTransactionDto> transactions;
}
