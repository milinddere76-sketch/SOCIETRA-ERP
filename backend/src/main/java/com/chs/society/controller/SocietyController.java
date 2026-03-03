package com.chs.society.controller;

import com.chs.society.model.Society;
import com.chs.society.model.User;
import com.chs.society.repository.SocietyRepository;
import com.chs.society.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/society")
@RequiredArgsConstructor
public class SocietyController {

    private final SocietyRepository societyRepository;
    private final UserRepository userRepository;

    @GetMapping("/settings")
    public ResponseEntity<Society> getSettings(Authentication authentication) {
        log.info("getSettings called. Auth: {}", authentication != null ? authentication.getName() : "NULL");
        if (authentication == null)
            return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(401).build();

        if (user.getSociety() == null) {
            boolean isSuperAdmin = user.getRoles().stream()
                    .anyMatch(r -> r.getName().contains("SUPER_ADMIN"));
            if (isSuperAdmin) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(user.getSociety());
    }

    // Super Admin: list all societies
    @GetMapping("/all")
    public ResponseEntity<List<Society>> getAllSocieties(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(societyRepository.findAll());
    }

    // Super Admin: get settings for a specific society by ID
    @GetMapping("/settings/{societyId}")
    public ResponseEntity<Society> getSettingsById(Authentication authentication, @PathVariable UUID societyId) {
        if (authentication == null)
            return ResponseEntity.status(401).build();
        Society society = societyRepository.findById(java.util.Objects.requireNonNull(societyId)).orElse(null);
        if (society == null)
            return ResponseEntity.status(404).build();
        return ResponseEntity.ok(society);
    }

    // Super Admin: update settings for a specific society by ID
    @PutMapping("/settings/{societyId}")
    public ResponseEntity<Society> updateSettingsById(Authentication authentication,
            @PathVariable UUID societyId,
            @RequestBody SocietySettingsRequest settings) {
        if (authentication == null)
            return ResponseEntity.status(401).build();
        Society society = societyRepository.findById(java.util.Objects.requireNonNull(societyId)).orElse(null);
        if (society == null)
            return ResponseEntity.status(404).build();
        try {
            if (settings.getMonthlyMaintenanceAmount() != null)
                society.setMonthlyMaintenanceAmount(settings.getMonthlyMaintenanceAmount());
            if (settings.getShareCertificateFee() != null)
                society.setShareCertificateFee(settings.getShareCertificateFee());
            if (settings.getNocCharges() != null)
                society.setNocCharges(settings.getNocCharges());
            if (settings.getUnitUtilityUsageRate() != null)
                society.setUnitUtilityUsageRate(settings.getUnitUtilityUsageRate());
            if (settings.getCulturalProgrammeFee() != null)
                society.setCulturalProgrammeFee(settings.getCulturalProgrammeFee());
            if (settings.getOtherCharges() != null)
                society.setOtherCharges(settings.getOtherCharges());
            society.setRecurringBillingEnabled(settings.isRecurringBillingEnabled());
            if (settings.getRecurringBillingDay() != null)
                society.setRecurringBillingDay(settings.getRecurringBillingDay());

            // Profile fields
            if (settings.getName() != null)
                society.setName(settings.getName());
            if (settings.getRegistrationNumber() != null)
                society.setRegistrationNumber(settings.getRegistrationNumber());
            if (settings.getAddress() != null)
                society.setAddress(settings.getAddress());
            if (settings.getCity() != null)
                society.setCity(settings.getCity());
            if (settings.getState() != null)
                society.setState(settings.getState());
            if (settings.getPincode() != null)
                society.setPincode(settings.getPincode());
            if (settings.getGstNumber() != null)
                society.setGstNumber(settings.getGstNumber());
            if (settings.getPanNumber() != null)
                society.setPanNumber(settings.getPanNumber());
            if (settings.getAdminEmail() != null)
                society.setAdminEmail(settings.getAdminEmail());
            if (settings.getAdminMobile() != null)
                society.setAdminMobile(settings.getAdminMobile());

            return ResponseEntity.ok(societyRepository.save(society));
        } catch (Exception e) {
            log.error("Error in updateSettingsById: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<Society> updateSettings(Authentication authentication,
            @RequestBody SocietySettingsRequest settings) {
        log.info("updateSettings called. User: {}, Settings: {}",
                authentication != null ? authentication.getName() : "NULL", settings);

        if (authentication == null)
            return ResponseEntity.status(403).build();
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null)
            return ResponseEntity.status(403).build();
        Society society = user.getSociety();
        if (society == null) {
            log.error("updateSettings: Manual check failed - User has no society object");
            return ResponseEntity.status(400).build();
        }

        try {
            if (settings.getMonthlyMaintenanceAmount() != null)
                society.setMonthlyMaintenanceAmount(settings.getMonthlyMaintenanceAmount());
            if (settings.getShareCertificateFee() != null)
                society.setShareCertificateFee(settings.getShareCertificateFee());
            if (settings.getNocCharges() != null)
                society.setNocCharges(settings.getNocCharges());
            if (settings.getUnitUtilityUsageRate() != null)
                society.setUnitUtilityUsageRate(settings.getUnitUtilityUsageRate());
            if (settings.getCulturalProgrammeFee() != null)
                society.setCulturalProgrammeFee(settings.getCulturalProgrammeFee());
            if (settings.getOtherCharges() != null)
                society.setOtherCharges(settings.getOtherCharges());

            society.setRecurringBillingEnabled(settings.isRecurringBillingEnabled());
            if (settings.getRecurringBillingDay() != null)
                society.setRecurringBillingDay(settings.getRecurringBillingDay());

            // Profile fields
            if (settings.getName() != null)
                society.setName(settings.getName());
            if (settings.getRegistrationNumber() != null)
                society.setRegistrationNumber(settings.getRegistrationNumber());
            if (settings.getAddress() != null)
                society.setAddress(settings.getAddress());
            if (settings.getCity() != null)
                society.setCity(settings.getCity());
            if (settings.getState() != null)
                society.setState(settings.getState());
            if (settings.getPincode() != null)
                society.setPincode(settings.getPincode());
            if (settings.getGstNumber() != null)
                society.setGstNumber(settings.getGstNumber());
            if (settings.getPanNumber() != null)
                society.setPanNumber(settings.getPanNumber());
            if (settings.getAdminEmail() != null)
                society.setAdminEmail(settings.getAdminEmail());
            if (settings.getAdminMobile() != null)
                society.setAdminMobile(settings.getAdminMobile());

            Society saved = societyRepository.save(society);
            log.info("Successfully updated society settings for ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error in updateSettings: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Data
    public static class SocietySettingsRequest {
        private String name;
        private String registrationNumber;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String gstNumber;
        private String panNumber;
        private String adminEmail;
        private String adminMobile;

        private Double monthlyMaintenanceAmount;
        private Double shareCertificateFee;
        private Double nocCharges;
        private Double unitUtilityUsageRate;
        private Double culturalProgrammeFee;
        private Double otherCharges;
        private boolean recurringBillingEnabled;
        private Integer recurringBillingDay;
    }
}
