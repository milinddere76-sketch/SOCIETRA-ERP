package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.model.maintenance.MaintenanceBill;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "receipts")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Receipt extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String receiptNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private BigDecimal amount;

    private String paymentMode; // Cash, Cheque, NEFT, UPI

    private String transactionReference; // Cheque No, UTR, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id")
    private MaintenanceBill bill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    private String narration;

    private BigDecimal currentBalance;
}
