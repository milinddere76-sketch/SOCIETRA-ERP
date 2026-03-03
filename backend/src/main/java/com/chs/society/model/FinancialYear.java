package com.chs.society.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "financial_years")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialYear extends BaseEntity {

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String yearName; // e.g., "2024-25"

    @Column(nullable = false)
    private LocalDate startDate; // e.g., 2024-04-01

    @Column(nullable = false)
    private LocalDate endDate; // e.g., 2025-03-31

    @Column(name = "is_active")
    @Builder.Default
    @JsonProperty("active")
    private boolean active = false;

    @Column(name = "is_closed")
    @Builder.Default
    @JsonProperty("closed")
    private boolean closed = false;

    // Keep backward-compatible getters for existing code
    public boolean isActive() {
        return active;
    }

    public boolean isClosed() {
        return closed;
    }
}
