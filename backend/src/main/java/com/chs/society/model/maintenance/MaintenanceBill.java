package com.chs.society.model.maintenance;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import com.chs.society.model.Unit;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceBill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false, unique = true)
    private String billNumber;

    private BigDecimal principalAmount;
    private BigDecimal previousDues;
    private BigDecimal interestAmount;
    private BigDecimal totalAmount;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private BillStatus status;

    public enum BillStatus {
        UNPAID, PARTIAL, PAID
    }
}
