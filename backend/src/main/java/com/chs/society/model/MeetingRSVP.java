package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meeting_rsvps", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "meeting_id", "user_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingRSVP extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private MeetingMinutes meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RSVPStatus status;

    private String remarks;

    public enum RSVPStatus {
        CONFIRMED, DECLINED, TENTATIVE
    }
}
