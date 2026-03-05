package com.chs.society.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_minutes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingMinutes extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "society_id", nullable = false)
    private Society society;

    @Column(nullable = false)
    private String title; // AGM 2024, SGM - Water Issues, Monthly Committee Meeting

    @Enumerated(EnumType.STRING)
    private MeetingType type;

    private LocalDateTime meetingDate;

    private String venue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String minutesContent; // Detailed discussion points

    private String pdfUrl; // Path to signed PDF scan

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "meeting_attendance", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "user_id")
    private java.util.List<java.util.UUID> attendanceIds = new java.util.ArrayList<>();

    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED

    public enum MeetingType {
        AGM, SGM, COMMITTEE, EMERGENCY, SPECIAL
    }
}
