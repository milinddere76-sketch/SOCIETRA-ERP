package com.chs.society.service;

import com.chs.society.dto.MeetingMinutesDto;
import com.chs.society.model.MeetingMinutes;
import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.repository.MeetingMinutesRepository;
import com.chs.society.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingMinutesService {
    private final MeetingMinutesRepository repository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WhatsAppNotificationService whatsappService;
    private final com.chs.society.repository.MeetingRSVPRepository rsvpRepository;
    private final EmailService emailService;

    public List<MeetingMinutesDto> getByUserEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            return List.of();
        return repository.findBySocietyIdOrderByIdDesc(user.getSociety().getId()).stream().map(m -> mapToDto(m, user))
                .collect(Collectors.toList());
    }

    public MeetingMinutesDto saveMeeting(String email, MeetingMinutesDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            throw new RuntimeException("User has no society");
        Society society = user.getSociety();
        MeetingMinutes entity = new MeetingMinutes();
        entity.setSociety(society);
        entity.setTitle(dto.getTitle() != null ? dto.getTitle() : "");
        entity.setVenue(dto.getVenue() != null ? dto.getVenue() : "Main Office");

        if (dto.getType() != null) {
            try {
                entity.setType(MeetingMinutes.MeetingType.valueOf(dto.getType().toUpperCase()));
            } catch (Exception e) {
            }
        }

        // Parse date if provided, else use now
        if (dto.getDate() != null && !dto.getDate().isEmpty()) {
            try {
                // Assuming format yyyy-MM-dd
                entity.setMeetingDate(java.time.LocalDate.parse(dto.getDate()).atStartOfDay());
            } catch (Exception e) {
                entity.setMeetingDate(LocalDateTime.now());
            }
        } else {
            entity.setMeetingDate(LocalDateTime.now());
        }

        entity.setDescription(dto.getNotes() != null ? dto.getNotes() : "");
        entity.setStatus("PUBLISHED");
        if (dto.getAttendanceIds() != null) {
            entity.setAttendanceIds(dto.getAttendanceIds());
        }

        repository.save(java.util.Objects.requireNonNull(entity));

        // Notifications — using admin's contact as sender identity
        if (dto.isNotifyMembers()) {
            List<User> staffAndMembers = userRepository.findBySocietyId(society.getId());
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            String dateStr = entity.getMeetingDate().format(fmt);
            String societyName = society.getName();
            // Admin acts as the organiser
            String adminName = user.getFirstName() + " " + user.getLastName();
            String adminEmail = user.getEmail();

            for (User u : staffAndMembers) {
                String memberName = u.getFirstName() + " " + u.getLastName();
                String dashMsg = String.format("Meeting '%s' (%s) on %s at %s.",
                        entity.getTitle(), entity.getType(), dateStr, entity.getVenue());
                notificationService.createNotification(u, "📅 Meeting Scheduled", dashMsg, "MEETING");

                if (u.getEmail() != null) {
                    emailService.sendMeetingInviteEmail(
                            u.getEmail(), memberName,
                            entity.getTitle(), entity.getType() != null ? entity.getType().name() : "",
                            dateStr, entity.getVenue(), entity.getDescription(),
                            societyName, adminName, adminEmail);
                }
                if (u.getPhone() != null) {
                    whatsappService.sendMeetingAlert(u.getPhone(),
                            entity.getTitle(), dateStr, entity.getVenue());
                }
            }

            // Also notify admin themselves as CC/confirmation
            if (adminEmail != null) {
                notificationService.sendEmail(adminEmail, "Meeting Published: " + entity.getTitle(),
                        String.format(
                                "You have scheduled a meeting '%s' on %s at %s. Notifications sent to %d member(s).",
                                entity.getTitle(), dateStr, entity.getVenue(), staffAndMembers.size()));
            }
        }

        return mapToDto(entity, user);
    }

    public void saveRsvp(String email, java.util.UUID meetingId, String status) {
        User user = userRepository.findByEmail(email).orElseThrow();
        MeetingMinutes meeting = repository.findById(meetingId).orElseThrow();

        com.chs.society.model.MeetingRSVP rsvp = rsvpRepository.findByMeetingIdAndUserId(meetingId, user.getId())
                .orElse(com.chs.society.model.MeetingRSVP.builder()
                        .meeting(meeting)
                        .user(user)
                        .build());

        rsvp.setStatus(com.chs.society.model.MeetingRSVP.RSVPStatus.valueOf(status.toUpperCase()));
        rsvpRepository.save(rsvp);
    }

    private MeetingMinutesDto mapToDto(MeetingMinutes entity, User currentUser) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        return MeetingMinutesDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .type(entity.getType() != null ? entity.getType().name() : "")
                .date(entity.getMeetingDate() != null ? entity.getMeetingDate().format(dateFormatter) : "")
                .time(entity.getMeetingDate() != null ? entity.getMeetingDate().format(timeFormatter) : "")
                .attendees(entity.getAttendanceIds() != null ? entity.getAttendanceIds().size() : 0)
                .status(entity.getStatus())
                .notes(entity.getDescription())
                .venue(entity.getVenue())
                .attendanceIds(entity.getAttendanceIds())
                .myRsvpStatus(
                        currentUser != null
                                ? rsvpRepository.findByMeetingIdAndUserId(entity.getId(), currentUser.getId())
                                        .map(r -> r.getStatus().name()).orElse(null)
                                : null)
                .confirmedCount(rsvpRepository.countByMeetingIdAndStatus(entity.getId(),
                        com.chs.society.model.MeetingRSVP.RSVPStatus.CONFIRMED))
                .declinedCount(rsvpRepository.countByMeetingIdAndStatus(entity.getId(),
                        com.chs.society.model.MeetingRSVP.RSVPStatus.DECLINED))
                .tentativeCount(rsvpRepository.countByMeetingIdAndStatus(entity.getId(),
                        com.chs.society.model.MeetingRSVP.RSVPStatus.TENTATIVE))
                .build();
    }
}
