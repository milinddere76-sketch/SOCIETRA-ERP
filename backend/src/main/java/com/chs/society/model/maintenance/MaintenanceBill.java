package com.chs.society.model.maintenance;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import com.chs.society.model.Unit;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @Builder.Default
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaintenanceBillItem> items = new ArrayList<>();

    @Builder.Default
    private Double repairsAndMaintenance = 0.0;
    @Builder.Default
    private Double sinkingFund = 0.0;
    @Builder.Default
    private Double serviceCharges = 0.0;
    @Builder.Default
    private Double commonUtilityCharges = 0.0;
    @Builder.Default
    private Double statutoryFees = 0.0;
    @Builder.Default
    private Double parkingCharges = 0.0;
    @Builder.Default
    private Double miscellaneousCharges = 0.0;
    @Builder.Default
    private Double otherCharges = 0.0;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private BillStatus status;

    public enum BillStatus {
        UNPAID, PARTIAL, PAID
    }

    public Double getRepairsAndMaintenance() {
        return repairsAndMaintenance;
    }

    public Double getSinkingFund() {
        return sinkingFund;
    }

    public Double getServiceCharges() {
        return serviceCharges;
    }

    public Double getCommonUtilityCharges() {
        return commonUtilityCharges;
    }

    public Double getStatutoryFees() {
        return statutoryFees;
    }

    public Double getParkingCharges() {
        return parkingCharges;
    }

    public Double getMiscellaneousCharges() {
        return miscellaneousCharges;
    }

    public Double getOtherCharges() {
        return otherCharges;
    }
}
