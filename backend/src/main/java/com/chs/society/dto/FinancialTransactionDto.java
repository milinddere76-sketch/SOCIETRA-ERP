package com.chs.society.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialTransactionDto {
    private UUID id;
    private String description;
    private String type;
    private Double amount;
    private String date;
    private String category;
    private String status;
    private String createdBy;
    private String approvedBy;
    private String approvalDate;
    private String rejectionReason;
    private String payeePayerName;
    private String paymentMode;
    private String transactionReference;
    private String voucherNumber;
}
