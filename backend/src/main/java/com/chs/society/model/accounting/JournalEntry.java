package com.chs.society.model.accounting;

import com.chs.society.model.BaseEntity;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "journal_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    private String voucherNumber;
    
    @Builder.Default
    private LocalDate transactionDate = LocalDate.now();
    
    @Column(columnDefinition = "TEXT")
    private String narration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AccountTransaction> transactions = new ArrayList<>();
}
