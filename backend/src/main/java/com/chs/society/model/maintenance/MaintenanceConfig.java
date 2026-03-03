package com.chs.society.model.maintenance;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "maintenance_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class MaintenanceConfig extends BaseEntity {

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", unique = true)
    private Society society;

    @Builder.Default
    private BigDecimal repairsAndMaintenance = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal sinkingFund = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal serviceCharges = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal commonUtilityCharges = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal statutoryFees = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal parkingCharges = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal miscellaneousCharges = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private CalculationMethod calculationMethod = CalculationMethod.FIXED;

    @Builder.Default
    private boolean recurringBillingEnabled = false;

    private Integer recurringBillingDay;

    public enum CalculationMethod {
        FIXED, PER_SQFT
    }
}
