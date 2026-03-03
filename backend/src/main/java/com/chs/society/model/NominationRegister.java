package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nomination_register")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NominationRegister extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private MemberRegister member;

    private String nomineeName;
    private String relationship;
    private BigDecimal sharePercentage;
    private String nomineeAddress;
    private LocalDate nominationDate;
    
    @Column(length = 1000)
    private String remarks;

    @Builder.Default
    private boolean isRegistered = false;
}
