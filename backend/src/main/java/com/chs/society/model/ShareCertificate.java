package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "share_certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareCertificate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false, unique = true)
    private String certificateNumber;

    private Integer sharesFrom;
    private Integer sharesTo;
    private Integer totalShares;
    private java.math.BigDecimal shareValue;

    private LocalDate issueDate;

    @Column(nullable = false)
    private String memberName;

    private String chairmanName;
    private String secretaryName;

    @Builder.Default
    private String status = "ISSUED"; // ISSUED, CANCELLED, TRANSFERRED
}
