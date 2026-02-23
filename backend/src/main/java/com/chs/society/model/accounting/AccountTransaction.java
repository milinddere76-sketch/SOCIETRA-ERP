package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "account_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ledger_id", nullable = false)
    private Ledger ledger;

    @Builder.Default
    private BigDecimal debit = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal credit = BigDecimal.ZERO;

    private BigDecimal balanceAfter;
}
