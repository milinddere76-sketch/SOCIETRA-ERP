package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bank_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankDetail extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String accountNumber;

    private String ifscCode;
    private String accountType;

    @Column(columnDefinition = "TEXT")
    private String qrCodeUrl;
}
