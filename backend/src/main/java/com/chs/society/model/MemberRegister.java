package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "member_register") // The "I" Register
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberRegister extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate admissionDate;
    private String membershipNumber;
    private LocalDate terminationDate;
    private String terminationReason;

    @Builder.Default
    private boolean isOriginalMember = true;
    
    @Column(length = 500)
    private String occupation;
    
    private String officeAddress;
}
