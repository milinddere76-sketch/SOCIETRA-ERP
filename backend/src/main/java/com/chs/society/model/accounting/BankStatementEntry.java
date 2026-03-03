package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import com.chs.society.model.FinancialTransaction;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bank_statement_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankStatementEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false)
    private String description;

    private String referenceNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String transactionType; // DR or CR

    @Builder.Default
    private boolean reconciled = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financial_transaction_id")
    private FinancialTransaction internalTransaction;
}
