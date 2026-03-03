package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wing_id", nullable = false)
    private Wing wing;

    @Column(nullable = false)
    private String unitNumber;

    private String unitType; // e.g., 2BHK, Shop
    private Double areaSqft;

    @Builder.Default
    private BigDecimal openingBalance = BigDecimal.ZERO; // Positive means dues, Negative means credit

    private LocalDate openingBalanceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    private String ownerName;
    @Builder.Default
    private boolean occupied = true;
}
