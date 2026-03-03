package com.chs.society.service;

import com.chs.society.model.Society;
import com.chs.society.repository.SocietyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class BillingScheduler {

    private final SocietyRepository societyRepository;
    private final BillingService billingService;
    private final com.chs.society.repository.MaintenanceConfigRepository configRepository;

    // Runs every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void generateRecurringBills() {
        int today = LocalDate.now().getDayOfMonth();
        List<Society> societies = societyRepository.findAll();

        for (Society society : societies) {
            com.chs.society.model.maintenance.MaintenanceConfig config = configRepository
                    .findBySocietyId(society.getId()).orElse(null);

            if (config != null && config.isRecurringBillingEnabled() &&
                    config.getRecurringBillingDay() != null && config.getRecurringBillingDay() == today) {

                String adminEmail = society.getAdminEmail();
                String billingMonth = LocalDate.now().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " "
                        + LocalDate.now().getYear();
                LocalDate generationDate = LocalDate.now();
                LocalDate dueDate = LocalDate.now().plusDays(15);

                try {
                    billingService.generateBillsForSociety(adminEmail, billingMonth, generationDate, dueDate);
                    log.info("Auto-generated recurring bills for society: {}", society.getName());
                } catch (Exception e) {
                    log.error("Failed to auto-generate bills for {}: {}", society.getName(), e.getMessage());
                }
            }
        }
    }
}
