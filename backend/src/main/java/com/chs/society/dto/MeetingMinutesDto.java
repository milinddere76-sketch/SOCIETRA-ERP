package com.chs.society.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingMinutesDto {
    private UUID id;
    private String title;
    private String type;
    private String date;
    private String time;
    private Integer attendees;
    private String status;
    private String notes;
    private String venue;
    private boolean notifyMembers;
    private java.util.List<java.util.UUID> attendanceIds;

    // RSVP Tracking
    private long confirmedCount;
    private long declinedCount;
    private long tentativeCount;
    private String myRsvpStatus;
}
