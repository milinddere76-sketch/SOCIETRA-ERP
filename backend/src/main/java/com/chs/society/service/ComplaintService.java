package com.chs.society.service;

import com.chs.society.dto.ComplaintDto;
import com.chs.society.model.Complaint;
import com.chs.society.model.User;
import com.chs.society.model.Unit;
import com.chs.society.repository.ComplaintRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;

    public List<ComplaintDto> getComplaintsByUserOrSociety(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "SOCIETY_ADMIN".equals(role.getName()) || "SUPER_ADMIN".equals(role.getName()));

        List<Complaint> complaints;
        if (isAdmin && user.getSociety() != null) {
            complaints = complaintRepository.findBySocietyIdOrderByCreatedAtDesc(user.getSociety().getId());
        } else {
            complaints = complaintRepository.findByRaisedByIdOrderByCreatedAtDesc(user.getId());
        }

        return complaints.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintDto createComplaint(String email, ComplaintDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getSociety() == null)
            throw new RuntimeException("User is not associated with a society");

        Complaint complaint = Complaint.builder()
                .society(user.getSociety())
                .raisedBy(user)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .category(Complaint.ComplaintCategory.valueOf(dto.getCategory().toUpperCase()))
                .status(Complaint.ComplaintStatus.OPEN)
                .attachmentUrl(dto.getAttachmentUrl())
                .build();

        complaint = complaintRepository.save(java.util.Objects.requireNonNull(complaint));
        return mapToDto(complaint);
    }

    @Transactional
    public ComplaintDto updateComplaintStatus(String email, UUID complaintId, String status, String resolutionNote) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "SOCIETY_ADMIN".equals(role.getName()) || "SUPER_ADMIN".equals(role.getName()));

        Complaint complaint = complaintRepository.findById(java.util.Objects.requireNonNull(complaintId))
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!isAdmin && !complaint.getRaisedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this complaint");
        }

        Complaint.ComplaintStatus newStatus = Complaint.ComplaintStatus.valueOf(status.toUpperCase());
        complaint.setStatus(newStatus);

        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)
                || "REJECTED".equalsIgnoreCase(status)) {
            if (complaint.getResolvedAt() == null) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
            if (resolutionNote != null && !resolutionNote.isBlank()) {
                complaint.setResolutionNote(resolutionNote);
            }
        }

        complaint = complaintRepository.save(complaint);
        return mapToDto(complaint);
    }

    private ComplaintDto mapToDto(Complaint c) {
        // Find unit of user if any
        String unitNameStr = "Admin/Staff";
        List<Unit> units = unitRepository.findBySocietyId(c.getSociety().getId());
        Unit memberUnit = units.stream().filter(u -> c.getRaisedBy().equals(u.getOwner())).findFirst().orElse(null);
        if (memberUnit != null) {
            unitNameStr = memberUnit.getWing().getName() + "-" + memberUnit.getUnitNumber();
        }

        return ComplaintDto.builder()
                .id(c.getId())
                .subject(c.getSubject())
                .description(c.getDescription())
                .category(c.getCategory() != null ? c.getCategory().name() : "")
                .status(c.getStatus() != null ? c.getStatus().name() : "")
                .memberName(c.getRaisedBy().getFirstName() + " " + c.getRaisedBy().getLastName())
                .raisedById(c.getRaisedBy().getId())
                .unitName(unitNameStr)
                .createdAt(c.getCreatedAt())
                .resolvedAt(c.getResolvedAt())
                .resolutionNote(c.getResolutionNote())
                .attachmentUrl(c.getAttachmentUrl())
                .build();
    }
}
