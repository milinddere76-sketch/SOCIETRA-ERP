package com.chs.society.model.maintenance;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "maintenance_heads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceHead extends BaseEntity {

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CalculationMethod calculationMethod = CalculationMethod.FIXED;

    public enum CalculationMethod {
        FIXED, PER_SQFT
    }
}
