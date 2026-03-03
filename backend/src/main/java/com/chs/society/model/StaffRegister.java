package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "staff_register")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffRegister extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String name;
    
    private String role; // Security, Manager, Sweeper, Electrician
    private String phone;
    private BigDecimal monthlySalary;
    private LocalDate joiningDate;
    
    @Builder.Default
    private boolean isActive = true;

    private String adhaarNumber;
    private String policeVerificationStatus;
}
