package com.chs.society.controller;

import com.chs.society.model.User;
import com.chs.society.repository.MaintenanceBillRepository;
import com.chs.society.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/society/reports")
@RequiredArgsConstructor
public class SocietyReportController {

    private final UserRepository userRepository;
    private final MaintenanceBillRepository billRepository;

    @GetMapping("/outstanding")
    public ResponseEntity<List<OutstandingReportItem>> getOutstandingReport(Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (admin.getSociety() == null)
            return ResponseEntity.status(403).build();

        List<User> members = userRepository.findBySocietyId(admin.getSociety().getId());

        List<OutstandingReportItem> report = members.stream().map(m -> {
            BigDecimal outstanding = billRepository.sumUnpaidAmountByUserId(m.getId()).orElse(BigDecimal.ZERO);
            return OutstandingReportItem.builder()
                    .memberId(m.getMemberId())
                    .memberName(m.getFirstName() + " " + m.getLastName())
                    .email(m.getEmail())
                    .phone(m.getPhone())
                    .outstandingAmount(outstanding.doubleValue())
                    .status(outstanding.compareTo(BigDecimal.ZERO) > 0 ? "Pending" : "Cleared")
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(report);
    }

    @Data
    @Builder
    public static class OutstandingReportItem {
        private String memberId;
        private String memberName;
        private String email;
        private String phone;
        private Double outstandingAmount;
        private String status;
    }
}
