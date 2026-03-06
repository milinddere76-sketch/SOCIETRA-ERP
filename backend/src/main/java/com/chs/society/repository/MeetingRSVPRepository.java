package com.chs.society.repository;

import com.chs.society.model.MeetingRSVP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingRSVPRepository extends JpaRepository<MeetingRSVP, UUID> {
    List<MeetingRSVP> findByMeetingId(UUID meetingId);

    Optional<MeetingRSVP> findByMeetingIdAndUserId(UUID meetingId, UUID userId);

    long countByMeetingIdAndStatus(UUID meetingId, MeetingRSVP.RSVPStatus status);

    @Modifying
    void deleteByUserId(UUID userId);

    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM MeetingRSVP r WHERE r.meeting.society.id = :societyId")
    void deleteBySocietyId(@org.springframework.data.repository.query.Param("societyId") UUID societyId);
}
