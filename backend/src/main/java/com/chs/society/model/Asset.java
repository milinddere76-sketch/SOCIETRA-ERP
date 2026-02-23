package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "asset_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String name;

    private String category; // LIFT, GENERATOR, PUMP, CCTV, FIRE_EXTINGUISHER
    private String location; // Wing A Terrace, Basement 1, etc.
    
    private LocalDate purchaseDate;
    private BigDecimal cost;
    private LocalDate warrantyExpiry;
    
    @Enumerated(EnumType.STRING)
    private AssetCondition conditionStatus;

    private String serialNumber;
    private String vendorContact;

    public enum AssetCondition {
        EXCELLENT, GOOD, MAINTENANCE_DUE, REPAIR_REQUIRED, DECOMMISSIONED
    }
}
