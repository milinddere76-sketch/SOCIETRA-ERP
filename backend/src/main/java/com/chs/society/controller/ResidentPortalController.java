package com.chs.society.controller;

import com.chs.society.dto.MaintenanceBillDto;
import com.chs.society.dto.UserDto;
import com.chs.society.model.Notification;
import com.chs.society.model.User;
import com.chs.society.model.maintenance.MaintenanceBill;
import com.chs.society.repository.MaintenanceBillRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.repository.FinancialTransactionRepository;
import com.chs.society.model.FinancialTransaction;
import com.chs.society.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;

@RestController
@RequestMapping("/api/resident")
@RequiredArgsConstructor
public class ResidentPortalController {

    private final UserRepository userRepository;
    private final MaintenanceBillRepository billRepository;
    private final NotificationService notificationService;
    private final FinancialTransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.chs.society.service.MeetingMinutesService meetingService;
    private final com.chs.society.service.WhatsAppNotificationService whatsappService;
    private final com.chs.society.service.PdfService pdfService;
    private final com.chs.society.service.EmailService emailService;

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
            @RequestBody Map<String, String> passwords) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401).build(); // Current password mismatch
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(mapToDto(user));
    }

    @GetMapping("/bills")
    public ResponseEntity<List<MaintenanceBillDto>> getMyBills(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<MaintenanceBill> bills = billRepository.findByUnitOwnerIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(bills.stream().map(this::mapBillToDto).collect(Collectors.toList()));
    }

    @PostMapping("/pay/{billId}")
    public ResponseEntity<Void> payBill(Authentication authentication, @PathVariable UUID billId) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        MaintenanceBill bill = billRepository.findById(java.util.Objects.requireNonNull(billId)).orElseThrow();

        // Ensure user owns this bill's unit
        if (bill.getUnit().getOwner() == null || !bill.getUnit().getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        bill.setStatus(MaintenanceBill.BillStatus.PAID);
        billRepository.save(bill);

        FinancialTransaction receipt = FinancialTransaction.builder()
                .society(bill.getSociety())
                .unit(bill.getUnit())
                .description("Maintenance Online Payment - " + bill.getBillNumber())
                .type("Credit")
                .amount(bill.getTotalAmount().doubleValue())
                .date(LocalDate.now())
                .category("Maintenance Collection")
                .payeePayerName(user.getFirstName() + " " + user.getLastName())
                .paymentMode("Online Portal")
                .transactionReference("ONL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .voucherNumber("REC-" + System.currentTimeMillis() % 100000)
                .build();

        transactionRepository.save(java.util.Objects.requireNonNull(receipt));

        notificationService.createNotification(
                user,
                "Payment Successful",
                "Your payment for bill " + bill.getBillNumber() + " has been recorded successfully.",
                "PAYMENT");

        // Compute current outstanding balance for this member
        java.math.BigDecimal remainingBalance = billRepository
                .findByUnitOwnerIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(b -> b.getStatus() == MaintenanceBill.BillStatus.UNPAID
                        || b.getStatus() == MaintenanceBill.BillStatus.PARTIAL)
                .map(MaintenanceBill::getTotalAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        String currentBalance = remainingBalance.toString();

        // Build a Receipt object for PDF generation
        com.chs.society.model.accounting.Receipt receiptDoc = com.chs.society.model.accounting.Receipt.builder()
                .receiptNumber("ONL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .date(LocalDate.now())
                .amount(bill.getTotalAmount())
                .paymentMode("Online Portal")
                .transactionReference(receipt.getTransactionReference())
                .member(user)
                .society(bill.getSociety())
                .narration("Maintenance Payment - " + bill.getBillNumber())
                .currentBalance(remainingBalance)
                .build();

        String memberName = user.getFirstName() + " " + user.getLastName();
        String amountStr = bill.getTotalAmount().toString();
        String receiptNo = receiptDoc.getReceiptNumber();

        // Generate receipt PDF and notify
        try {
            byte[] receiptPdf = pdfService.generateReceiptPdf(receiptDoc);
            if (user.getEmail() != null) {
                emailService.sendReceiptEmail(user.getEmail(), memberName, receiptNo,
                        amountStr, currentBalance, bill.getSociety().getName(), receiptPdf);
            }
        } catch (Exception ex) {
            // Email failure must not block payment confirmation
        }

        if (user.getPhone() != null) {
            whatsappService.sendPaymentConfirmation(user.getPhone(), bill.getBillNumber(), amountStr);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getId()));
    }

    @GetMapping("/meetings")
    public ResponseEntity<List<com.chs.society.dto.MeetingMinutesDto>> getMeetings(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (user.getSociety() == null)
            return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(meetingService.getByUserEmail(user.getEmail()));
    }

    @PostMapping("/meetings/{id}/rsvp")
    public ResponseEntity<Void> submitRsvp(Authentication authentication, @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        meetingService.saveRsvp(authentication.getName(), id, body.get("status"));
        return ResponseEntity.ok().build();
    }

    private UserDto mapToDto(User u) {
        UserDto d = new UserDto();
        d.setId(u.getId());
        d.setFirstName(u.getFirstName());
        d.setLastName(u.getLastName());
        d.setEmail(u.getEmail());
        d.setPhone(u.getPhone());
        d.setMemberId(u.getMemberId());
        d.setAddress(u.getAddress());
        d.setProfilePhoto(u.getProfilePhoto());
        d.setSocietyName(u.getSociety() != null ? u.getSociety().getName() : "N/A");
        return d;
    }

    private MaintenanceBillDto mapBillToDto(MaintenanceBill entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return MaintenanceBillDto.builder()
                .id(entity.getId().toString())
                .invoiceNo(entity.getBillNumber())
                .unit(entity.getUnit().getWing().getName() + "-" + entity.getUnit().getUnitNumber())
                .amount(entity.getTotalAmount() != null ? entity.getTotalAmount().doubleValue() : 0.0)
                .totalAmount(entity.getTotalAmount() != null ? entity.getTotalAmount().doubleValue() : 0.0)
                .dueDate(entity.getDueDate() != null ? entity.getDueDate().format(formatter) : "")
                .status(entity.getStatus() != null ? entity.getStatus().toString() : "UNPAID")
                .repairsAndMaintenance(
                        entity.getRepairsAndMaintenance() != null ? entity.getRepairsAndMaintenance().doubleValue()
                                : 0.0)
                .sinkingFund(entity.getSinkingFund() != null ? entity.getSinkingFund().doubleValue() : 0.0)
                .serviceCharges(entity.getServiceCharges() != null ? entity.getServiceCharges().doubleValue() : 0.0)
                .commonUtilityCharges(
                        entity.getCommonUtilityCharges() != null ? entity.getCommonUtilityCharges().doubleValue() : 0.0)
                .statutoryFees(entity.getStatutoryFees() != null ? entity.getStatutoryFees().doubleValue() : 0.0)
                .parkingCharges(entity.getParkingCharges() != null ? entity.getParkingCharges().doubleValue() : 0.0)
                .miscellaneousCharges(
                        entity.getMiscellaneousCharges() != null ? entity.getMiscellaneousCharges().doubleValue() : 0.0)
                .otherCharges(entity.getOtherCharges() != null ? entity.getOtherCharges().doubleValue() : 0.0)
                .previousDues(entity.getPreviousDues() != null ? entity.getPreviousDues().doubleValue() : 0.0)
                .interestAmount(entity.getInterestAmount() != null ? entity.getInterestAmount().doubleValue() : 0.0)
                .build();
    }
}
