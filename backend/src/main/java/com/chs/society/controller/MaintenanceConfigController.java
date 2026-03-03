package com.chs.society.controller;

import com.chs.society.model.maintenance.MaintenanceConfig;
import com.chs.society.repository.MaintenanceConfigRepository;
import com.chs.society.repository.UserRepository;
import com.chs.society.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequestMapping("/api/maintenance-config")
@RequiredArgsConstructor
public class MaintenanceConfigController {

    private final MaintenanceConfigRepository configRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<MaintenanceConfig> getConfig(Authentication authentication) {
        log.info("getConfig called. Auth: {}", authentication != null ? authentication.getName() : "NULL");

        if (authentication == null) {
            log.error(
                    "MaintenanceConfig fetch failed: No authentication found in SecurityContext even though request was permitted. This means JwtFilter failed to set it.");
            // Return 403 instead of 401 to prevent automatic frontend logout if someone
            // visits without authorization
            return ResponseEntity.status(403).build();
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            log.error("MaintenanceConfig fetch: User Not Found with email: {}", authentication.getName());
            return ResponseEntity.status(403).build();
        }

        if (user.getSociety() == null) {
            log.warn("MaintenanceConfig fetch: User {} has no society", user.getEmail());
            return ResponseEntity.badRequest().build();
        }

        MaintenanceConfig config = configRepository.findBySocietyId(user.getSociety().getId())
                .orElse(MaintenanceConfig.builder().society(user.getSociety()).build());
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<MaintenanceConfig> saveConfig(Authentication authentication,
            @RequestBody MaintenanceConfig config) {
        log.info("saveConfig called. User: {}, Config: {}", authentication != null ? authentication.getName() : "NULL",
                config);

        if (authentication == null)
            return ResponseEntity.status(403).build();

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            log.error("saveConfig: User not found for email: {}", authentication.getName());
            return ResponseEntity.status(403).build();
        }

        if (user.getSociety() == null) {
            log.error("saveConfig: User {} has no society associated", user.getEmail());
            return ResponseEntity.badRequest().build();
        }

        try {
            MaintenanceConfig existing = configRepository.findBySocietyId(user.getSociety().getId())
                    .orElseGet(() -> {
                        log.info("Creating new MaintenanceConfig for society: {}", user.getSociety().getName());
                        return MaintenanceConfig.builder().society(user.getSociety()).build();
                    });

            log.info("Updating MaintenanceConfig for society: {}", user.getSociety().getName());

            existing.setRepairsAndMaintenance(config.getRepairsAndMaintenance());
            existing.setSinkingFund(config.getSinkingFund());
            existing.setServiceCharges(config.getServiceCharges());
            existing.setCommonUtilityCharges(config.getCommonUtilityCharges());
            existing.setStatutoryFees(config.getStatutoryFees());
            existing.setParkingCharges(config.getParkingCharges());
            existing.setMiscellaneousCharges(config.getMiscellaneousCharges());
            existing.setCalculationMethod(config.getCalculationMethod());
            existing.setRecurringBillingEnabled(config.isRecurringBillingEnabled());
            existing.setRecurringBillingDay(config.getRecurringBillingDay());

            MaintenanceConfig saved = configRepository.save(existing);
            log.info("Successfully saved MaintenanceConfig with ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Critical error saving MaintenanceConfig: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
