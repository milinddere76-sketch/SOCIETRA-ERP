package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountGroup extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id")
    private Society society;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private AccountGroup parent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    public enum AccountType {
        ASSET, LIABILITY, INCOME, EXPENSE
    }
}
