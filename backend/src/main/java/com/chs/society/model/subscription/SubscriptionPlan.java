package com.chs.society.model.subscription;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "subscription_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name; // BASIC, PROFESSIONAL, ENTERPRISE

    private Integer maxFlats;
    private BigDecimal monthlyPrice;
    
    @Column(columnDefinition = "JSONB")
    private String features;
}
