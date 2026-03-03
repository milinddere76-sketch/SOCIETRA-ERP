package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "society_committee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String designation; // CHAIRMAN, SECRETARY, TREASURER, MEMBER

    private String mobile;
    private String email;
    private String unitNumber;

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private boolean isActive = true;
}
