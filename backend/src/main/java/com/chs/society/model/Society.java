package com.chs.society.model;

import com.chs.society.model.subscription.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "societies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Society extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String societyCode;

    private String registrationNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;
    private String state;
    private String pincode;

    private String gstNumber;
    private String panNumber;

    private String country;
    private String adminEmail;
    private String adminMobile;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SocietyStatus status = SocietyStatus.PENDING;

    @Builder.Default
    private boolean isApproved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan subscriptionPlan;

    private LocalDate subscriptionExpiry;

    @Builder.Default
    private Integer memberLimit = 50;

    // Billing Configuration
    private Double monthlyMaintenanceAmount;
    private Double shareCertificateFee;
    private Double nocCharges;
    private Double unitUtilityUsageRate;
    private Double culturalProgrammeFee;
    private Double otherCharges;

    @Builder.Default
    private boolean recurringBillingEnabled = false;

    private Integer recurringBillingDay;

    @Column(columnDefinition = "TEXT")
    private String enabledFeatures; // JSON string of feature keys

    public enum SocietyStatus {
        PENDING, ACTIVE, SUSPENDED, INACTIVE
    }
}
