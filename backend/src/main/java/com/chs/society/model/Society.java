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

    private String registrationNumber;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    private String city;
    private String state;
    private String pincode;
    
    private String gstNumber;
    private String panNumber;

    @Enumerated(EnumType.STRING)
    private SocietyStatus status = SocietyStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private SubscriptionPlan subscriptionPlan;

    private LocalDate subscriptionExpiry;

    public enum SocietyStatus {
        PENDING, ACTIVE, SUSPENDED
    }
}
