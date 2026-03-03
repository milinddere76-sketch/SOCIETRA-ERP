package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "parking_register")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingRegister extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @Column(nullable = false)
    private String parkingSlotNumber;
    
    @Enumerated(EnumType.STRING)
    private ParkingType type; // OPEN, COVERED, STILT, PUZZLE

    private BigDecimal monthlyCharges;

    public enum ParkingType {
        OPEN, COVERED, STILT, PUZZLE
    }
}
