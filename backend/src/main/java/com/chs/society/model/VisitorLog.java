package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit; // Can be null for society office/general visits

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String purpose;
    private String vehicleNumber;
    
    @Column(nullable = false)
    private LocalDateTime entryTime;
    
    private LocalDateTime exitTime;

    @Enumerated(EnumType.STRING)
    private VisitorType type;

    public enum VisitorType {
        GUEST, DELIVERY, CAB, STAFF, VENDOR
    }
}
