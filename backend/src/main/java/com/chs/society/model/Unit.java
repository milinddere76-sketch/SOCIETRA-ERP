package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;

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
    private String ownerName;
    private boolean occupied = true;
}
